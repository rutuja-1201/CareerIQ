"use client";

import { JOB_ROLES, CUSTOM_ROLE } from "@/lib/job-roles";
import { Label, Input, Select } from "@/components/ui/input";

type RoleSelectProps = {
  label?: string;
  value: string;
  onChange: (role: string) => void;
  required?: boolean;
  className?: string;
};

export function RoleSelect({ label = "Target Role", value, onChange, required, className }: RoleSelectProps) {
  const isCustom = value !== "" && !JOB_ROLES.includes(value as (typeof JOB_ROLES)[number]);
  const preset = isCustom ? CUSTOM_ROLE : value || JOB_ROLES[0];
  const customValue = isCustom ? value : "";

  const handlePresetChange = (next: string) => {
    if (next === CUSTOM_ROLE) onChange(customValue);
    else onChange(next);
  };

  return (
    <div className={className}>
      <Label>{label}</Label>
      <Select
        value={preset}
        onChange={(e) => handlePresetChange(e.target.value)}
        required={required}
        className="mt-1"
      >
        {JOB_ROLES.map((role) => (
          <option key={role} value={role}>{role}</option>
        ))}
        <option value={CUSTOM_ROLE}>Other (custom role)</option>
      </Select>
      {preset === CUSTOM_ROLE && (
        <Input
          value={customValue}
          onChange={(e) => onChange(e.target.value)}
          placeholder="e.g. MERN Stack Developer"
          required={required}
          className="mt-2"
        />
      )}
    </div>
  );
}
