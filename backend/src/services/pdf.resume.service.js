import puppeteer from 'puppeteer';

const DEFAULT_STYLE = {
  fontFamily: 'Helvetica Neue',
  fontSize: 10.5,
  lineHeight: 1.4,
  sectionSpacing: 18,
  nameFontSize: 28,
  pagePadding: 40,
};

const generateResumeHTML = (resume, stylePrefs = {}) => {
  const { contact, summary, experience, skills, education, certifications } = resume;
  const style = { ...DEFAULT_STYLE, ...stylePrefs };

  // Extract tech stacks from experience bullets if needed
  const getTechStack = (exp) => {
    // If bullets contain tech keywords, extract them
    const allText = (exp.bullets || []).join(' ');
    const techKeywords = allText.match(/\b(ReactJs|React|Angular|Vue|Node\.?js|NodeJs|Python|Java|JavaScript|TypeScript|MongoDB|MySQL|PostgreSQL|AWS|Docker|Kubernetes|Spring Boot|Express\.?js|Tailwind CSS|Material UI|Next\.js|AdonisJs|HTML|CSS|Bootstrap)\b/gi);
    return techKeywords ? [...new Set(techKeywords.map(t => t.trim()))].slice(0, 8).join(', ') : '';
  };

  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${contact?.name || 'Resume'}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: '${style.fontFamily}', Arial, sans-serif;
            font-size: ${style.fontSize}pt;
            line-height: ${style.lineHeight};
            color: #000;
            padding: ${style.pagePadding}px ${style.pagePadding + 20}px;
            max-width: 900px;
            margin: 0 auto;
            background: #fff;
        }

        /* Header */
        .header {
            text-align: center;
            margin-bottom: ${style.sectionSpacing}px;
        }

        .name {
            font-size: ${style.nameFontSize}pt;
            font-weight: bold;
            margin-bottom: 8px;
            color: #000;
        }

        .contact-info {
            font-size: 10pt;
            color: #2563eb;
            line-height: 1.6;
        }

        .contact-info a {
            color: #2563eb;
            text-decoration: none;
        }

        /* Section Headers */
        h2 {
            font-size: ${style.fontSize + 0.5}pt;
            font-weight: bold;
            margin-top: ${style.sectionSpacing}px;
            margin-bottom: 10px;
            border-bottom: 1.5px solid #000;
            padding-bottom: 2px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        /* Education */
        .education-item {
            margin-bottom: 10px;
        }

        .edu-header {
            display: flex;
            justify-content: space-between;
            align-items: baseline;
        }

        .edu-school {
            font-weight: bold;
            font-size: 10.5pt;
        }

        .edu-date {
            font-size: 10pt;
            text-align: right;
        }

        .edu-degree {
            font-size: 10pt;
            margin-top: 2px;
        }

        /* Experience */
        .experience-item {
            margin-bottom: 14px;
        }

        .exp-header {
            display: flex;
            justify-content: space-between;
            align-items: baseline;
            margin-bottom: 2px;
        }

        .exp-company {
            font-weight: bold;
            font-size: 10.5pt;
        }

        .exp-date {
            font-size: 10pt;
            text-align: right;
        }

        .exp-title-line {
            display: flex;
            justify-content: space-between;
            align-items: baseline;
            margin-bottom: 4px;
        }

        .exp-title {
            font-style: italic;
            font-size: 10pt;
        }

        .exp-tech {
            font-size: 9.5pt;
            color: #333;
            text-align: right;
            max-width: 60%;
        }

        /* Bullets */
        ul {
            margin-left: 18px;
            margin-top: 4px;
            margin-bottom: 6px;
        }

        li {
            margin-bottom: 3px;
            font-size: ${style.fontSize}pt;
            line-height: ${style.lineHeight};
        }

        .summary-text {
            font-size: ${style.fontSize}pt;
            line-height: ${style.lineHeight};
            margin-bottom: 6px;
        }

        /* Skills */
        .skills-section {
            margin-bottom: 12px;
        }

        .skill-category {
            margin-bottom: 6px;
        }

        .skill-label {
            font-weight: bold;
            display: inline;
            font-size: 10pt;
        }

        .skill-list {
            display: inline;
            font-size: 10pt;
        }

        /* Projects */
        .project-item {
            margin-bottom: 12px;
        }

        .project-header {
            display: flex;
            justify-content: space-between;
            align-items: baseline;
            margin-bottom: 2px;
        }

        .project-name {
            font-weight: bold;
            font-size: 10.5pt;
        }

        .project-date {
            font-size: 10pt;
        }

        .project-tech {
            font-style: italic;
            font-size: 9.5pt;
            color: #333;
            margin-bottom: 3px;
        }

        @media print {
            body {
                padding: 30px 50px;
            }
        }
    </style>
</head>
<body>
    <!-- Header -->
    <div class="header">
        <div class="name">${contact?.name || 'Professional Resume'}</div>
        <div class="contact-info">
            ${contact?.email || ''} ${contact?.email && contact?.phone ? ' | ' : ''}
            ${contact?.phone || ''} ${contact?.phone && contact?.github ? ' | ' : ''}
            ${contact?.github ? `<a href="https://${contact.github}">${contact.github}</a>` : ''} ${contact?.github && contact?.linkedin ? ' | ' : ''}
            ${contact?.linkedin ? `<a href="https://${contact.linkedin}">${contact.linkedin}</a>` : ''}
        </div>
    </div>

    ${summary ? `
    <h2>SUMMARY</h2>
    <p class="summary-text">${summary}</p>
    ` : ''}

    <!-- Education -->
    ${education && education.length > 0 ? `
    <h2>EDUCATION</h2>
    ${education.map(edu => `
        <div class="education-item">
            <div class="edu-header">
                <div class="edu-school">${edu.institution || edu.degree || 'Institution'}</div>
                <div class="edu-date">${edu.year || ''}</div>
            </div>
            <div class="edu-degree">${edu.degree || ''}</div>
        </div>
    `).join('')}
    ` : ''}

    <!-- Experience -->
    ${experience && experience.length > 0 ? `
    <h2>EXPERIENCE</h2>
    ${experience.map(exp => {
      const techStack = getTechStack(exp);
      return `
        <div class="experience-item">
            <div class="exp-header">
                <div class="exp-company">${exp.company || 'Company'}</div>
                <div class="exp-date">${exp.duration || ''}</div>
            </div>
            <div class="exp-title-line">
                <div class="exp-title">${exp.title || 'Position'}</div>
                ${techStack ? `<div class="exp-tech">${techStack}</div>` : ''}
            </div>
            ${exp.bullets && exp.bullets.length > 0 ? `
            <ul>
                ${exp.bullets.map(bullet => `<li>${bullet}</li>`).join('')}
            </ul>
            ` : ''}
        </div>
      `;
    }).join('')}
    ` : ''}

    <!-- Skills -->
    ${skills && skills.length > 0 ? `
    <h2>SKILLS</h2>
    <div class="skills-section">
        <div class="skill-category">
            <div class="skill-label">Technologies & Tools:</div>
            <div class="skill-list">${skills.join(', ')}</div>
        </div>
        ${certifications && certifications.length > 0 ? `
        <div class="skill-category">
            <div class="skill-label">Certifications:</div>
            <div class="skill-list">${certifications.join(', ')}</div>
        </div>
        ` : ''}
    </div>
    ` : ''}

</body>
</html>
  `.trim();
};

// Generate PDF from resume data
export const generateResumePDF = async (resumeData, stylePrefs = {}) => {
  let browser;
  try {
    const html = generateResumeHTML(resumeData, stylePrefs);

    // Launch puppeteer
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });

    // Generate PDF
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '0.4in',
        right: '0.6in',
        bottom: '0.4in',
        left: '0.6in',
      },
    });

    return pdfBuffer;
  } catch (error) {
    console.error('PDF generation error:', error);
    throw new Error('Failed to generate PDF: ' + error.message);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
};
