"use client";

import React, { useState, useRef, useEffect, useLayoutEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { ChevronDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, "onChange"> {
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  children: React.ReactNode;
  className?: string;
  menuClassName?: string;
}

const MENU_MAX_HEIGHT = 240;
const MENU_GAP = 6;

export function Select({
  value,
  onChange,
  children,
  className,
  menuClassName,
  disabled,
  ...props
}: SelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedValue, setSelectedValue] = useState(value || "");
  const [mounted, setMounted] = useState(false);
  const [placement, setPlacement] = useState<"top" | "bottom">("bottom");
  const [menuStyle, setMenuStyle] = useState<React.CSSProperties>({});
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const selectRef = useRef<HTMLSelectElement>(null);

  const options = React.Children.toArray(children).filter(
    (child): child is React.ReactElement<React.OptionHTMLAttributes<HTMLOptionElement>> =>
      React.isValidElement(child) && child.type === "option"
  );

  const currentValue = value ?? selectedValue;
  const selectedOption = options.find((opt) => opt.props.value === currentValue);
  const selectedLabel = selectedOption?.props.children || "Select...";
  const isLight =
    className?.includes("bg-white") ||
    className?.includes("text-gray") ||
    menuClassName?.includes("bg-white");

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (value !== undefined) setSelectedValue(value);
  }, [value]);

  const updatePosition = useCallback(() => {
    const trigger = buttonRef.current;
    if (!trigger) return;

    const rect = trigger.getBoundingClientRect();
    const menuHeight = Math.min(
      MENU_MAX_HEIGHT,
      menuRef.current?.scrollHeight ?? MENU_MAX_HEIGHT
    );
    const spaceBelow = window.innerHeight - rect.bottom - MENU_GAP;
    const spaceAbove = rect.top - MENU_GAP;
    const openUp = spaceBelow < menuHeight && spaceAbove > spaceBelow;

    setPlacement(openUp ? "top" : "bottom");
    setMenuStyle({
      position: "fixed",
      left: rect.left,
      width: rect.width,
      zIndex: 9990,
      ...(openUp
        ? { bottom: window.innerHeight - rect.top + MENU_GAP }
        : { top: rect.bottom + MENU_GAP }),
    });
  }, []);

  useLayoutEffect(() => {
    if (!isOpen) return;
    updatePosition();
    const raf = requestAnimationFrame(updatePosition);
    return () => cancelAnimationFrame(raf);
  }, [isOpen, options.length, updatePosition]);

  useEffect(() => {
    if (!isOpen) return;

    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        !containerRef.current?.contains(target) &&
        !menuRef.current?.contains(target)
      ) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false);
    };

    const handleScroll = () => updatePosition();

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    window.addEventListener("scroll", handleScroll, true);
    window.addEventListener("resize", updatePosition);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("scroll", handleScroll, true);
      window.removeEventListener("resize", updatePosition);
    };
  }, [isOpen, updatePosition]);

  const handleSelect = (optionValue: string) => {
    setSelectedValue(optionValue);
    setIsOpen(false);

    if (onChange && selectRef.current) {
      selectRef.current.value = optionValue;
      onChange({
        target: selectRef.current,
        currentTarget: selectRef.current,
      } as React.ChangeEvent<HTMLSelectElement>);
    }
  };

  const menu = isOpen && mounted && (
    <div
      ref={menuRef}
      style={menuStyle}
      role="listbox"
      className={cn(
        "rounded-xl border shadow-2xl backdrop-blur-xl overflow-hidden transition-all duration-150",
        isLight
          ? "border-gray-200 bg-white/95 shadow-gray-300/30"
          : "border-white/10 bg-[#0f1524]/95 shadow-black/40",
        menuClassName
      )}
    >
      <div className="max-h-60 overflow-y-auto py-1.5 overscroll-contain">
        {options.map((option) => {
          const optionValue = option.props.value as string;
          const isSelected = optionValue === currentValue;

          return (
            <button
              key={optionValue}
              type="button"
              role="option"
              aria-selected={isSelected}
              onClick={() => handleSelect(optionValue)}
              className={cn(
                "flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-sm transition-colors",
                isLight
                  ? cn(
                      "text-gray-700 hover:bg-indigo-50",
                      isSelected && "bg-indigo-50 font-medium text-indigo-700"
                    )
                  : cn(
                      "text-slate-300 hover:bg-gradient-to-r hover:from-indigo-500/20 hover:to-violet-500/15",
                      isSelected &&
                        "bg-gradient-to-r from-indigo-500/30 to-violet-500/20 font-medium text-white"
                    )
              )}
            >
              <span className="truncate">{option.props.children}</span>
              {isSelected && (
                <Check
                  className={cn(
                    "h-3.5 w-3.5 shrink-0",
                    isLight ? "text-indigo-600" : "text-indigo-300"
                  )}
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );

  return (
    <div ref={containerRef} className="relative">
      <select
        ref={selectRef}
        value={currentValue}
        onChange={onChange}
        className="sr-only"
        disabled={disabled}
        {...props}
      >
        {children}
      </select>

      <button
        ref={buttonRef}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        onClick={() => !disabled && setIsOpen((open) => !open)}
        disabled={disabled}
        className={cn(
          "flex h-10 w-full items-center justify-between rounded-xl border px-3 py-2 text-sm shadow-sm transition-colors",
          isLight
            ? "border-gray-300 bg-white text-gray-900 hover:border-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
            : "border-white/10 bg-[#0b1020] text-slate-100 hover:border-white/20 focus:border-indigo-500/50 focus:outline-none focus:ring-2 focus:ring-indigo-500/30",
          disabled && "cursor-not-allowed opacity-50",
          className
        )}
      >
        <span className={cn("truncate", !currentValue && (isLight ? "text-gray-400" : "text-slate-500"))}>
          {selectedLabel}
        </span>
        <ChevronDown
          className={cn(
            "h-4 w-4 shrink-0 transition-transform duration-200",
            isLight ? "text-gray-400" : "text-slate-400",
            isOpen && "rotate-180"
          )}
        />
      </button>

      {mounted && menu && createPortal(menu, document.body)}
    </div>
  );
}
