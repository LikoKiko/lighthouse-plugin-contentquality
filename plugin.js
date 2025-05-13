// main plugin setup
module.exports = {
  audits: [
    { path: 'audits/contentlength.js' },
    { path: 'audits/readinglevel.js' },
    { path: 'audits/keyworddensity.js' },
    { path: 'audits/headingstructure.js' },
    { path: 'audits/imagetextratio.js' }
  ],

  category: {
    title: 'Content Quality',
    description: 'Checks how good ur web content is',
    auditRefs: [
      { id: 'content-length', weight: 1, group: 'content-basics' },
      { id: 'reading-level', weight: 1, group: 'content-basics' },
      { id: 'keyword-check', weight: 1, group: 'content-seo' },
      { id: 'heading-check', weight: 1, group: 'content-structure' },
      { id: 'image-text-ratio', weight: 1, group: 'content-visuals' }
    ]
  },

  groups: {
    'content-basics': {
      title: 'Content Basics'
    },
    'content-seo': {
      title: 'SEO Checks'
    },
    'content-structure': {
      title: 'Content Structure'
    },
    'content-visuals': {
      title: 'Visual Content'
    }
  }
};
