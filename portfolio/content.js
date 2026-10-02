export const defaultPortfolioContent = {
  hero: {
    titleLine1: 'Thoughtful interfaces.',
    titleLine2: 'Reliable delivery.',
    intro: 'I’m Aayusha, a front-end developer focused on building polished, responsive digital experiences with clear business impact and strong product thinking.',
    availability: 'Available for product-focused roles',
  },
  about: {
    heading: 'Front-end developer with a product mindset',
    paragraph1: 'I build responsive, user-centered interfaces that turn complex requirements into clear, practical experiences for clients and end users.',
    paragraph2: 'My work blends design thinking, front-end engineering, and iterative improvement—creating interfaces that are usable, maintainable, and ready for real-world product use.',
  },
  projects: {
    reliefHub: {
      title: 'BhoteKoshi Relief Hub',
      description: 'A responsive community information and reporting portal designed for operational support, public updates, and structured client-facing information flow across affected areas.',
    },
    deepScan: {
      title: 'DeepScan',
      description: 'A team-based exploration into media authenticity and AI-assisted verification workflows, focused on evaluating detection approaches in a research and validation context.',
    },
  },
};

export function applyPortfolioContent(content) {
  const entries = [
    ['hero.titleLine1', content.hero?.titleLine1],
    ['hero.titleLine2', content.hero?.titleLine2],
    ['hero.intro', content.hero?.intro],
    ['hero.availability', content.hero?.availability],
    ['about.heading', content.about?.heading],
    ['about.paragraph1', content.about?.paragraph1],
    ['about.paragraph2', content.about?.paragraph2],
    ['projects.reliefHub.title', content.projects?.reliefHub?.title],
    ['projects.reliefHub.description', content.projects?.reliefHub?.description],
    ['projects.deepScan.title', content.projects?.deepScan?.title],
    ['projects.deepScan.description', content.projects?.deepScan?.description],
  ];

  for (const [key, value] of entries) {
    if (typeof value !== 'string') continue;
    const element = document.querySelector(`[data-content="${key}"]`);
    if (element) element.textContent = value;
  }
}

export function validatePortfolioContent(content) {
  const fields = [
    ['Hero headline (line 1)', content.hero?.titleLine1, 60],
    ['Hero headline (line 2)', content.hero?.titleLine2, 60],
    ['Introduction', content.hero?.intro, 320],
    ['Availability', content.hero?.availability, 100],
    ['About heading', content.about?.heading, 100],
    ['About paragraph 1', content.about?.paragraph1, 800],
    ['About paragraph 2', content.about?.paragraph2, 800],
    ['BhoteKoshi Relief Hub title', content.projects?.reliefHub?.title, 100],
    ['BhoteKoshi Relief Hub description', content.projects?.reliefHub?.description, 800],
    ['DeepScan title', content.projects?.deepScan?.title, 100],
    ['DeepScan description', content.projects?.deepScan?.description, 800],
  ];

  for (const [label, value, maxLength] of fields) {
    if (typeof value !== 'string' || value.trim().length === 0) {
      return `${label} is required.`;
    }
    if (value.length > maxLength) {
      return `${label} must be ${maxLength} characters or fewer.`;
    }
  }

  return '';
}
