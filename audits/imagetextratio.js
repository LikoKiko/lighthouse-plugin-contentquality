const Audit = require('lighthouse').Audit;

// check img to text balance
class ImageTextRatioAudit extends Audit {
  static get meta() {
    return {
      id: 'image-text-ratio',
      title: 'Page has a good mix of images and text',
      failureTitle: 'Page needs a better mix of images and text',
      description: 'Pages with both imgs and text keep ppl interested. Too many imgs slow loading, too few make pages boring.',
      requiredArtifacts: ['ImageElements', 'MainDocumentContent']
    };
  }

  static audit(artifacts) {
    const imgs = artifacts.ImageElements || [];

    const visImgs = imgs.filter(img =>
      !img.isInShadowDOM && img.width > 1 && img.height > 1
    );

    const txtLen = (artifacts.MainDocumentContent || '').length;

    if (txtLen < 1000) {
      return {
        score: null,
        notApplicable: true,
        explanation: 'Page too small to check img-text mix'
      };
    }

    const ratio = (visImgs.length / txtLen) * 1000;

    const FEW = 0.5;
    const MIN = 1;
    const MAX = 3;
    const MANY = 5;

    let score;
    if (ratio >= MIN && ratio <= MAX) {
      score = 1;
    } else if (ratio > MAX && ratio <= MANY) {
      score = 1 - ((ratio - MAX) / (MANY - MAX));
    } else if (ratio < MIN && ratio >= FEW) {
      score = 0.6 + ((ratio - FEW) / (MIN - FEW) * 0.4);
    } else if (ratio > MANY) {
      score = 0.2;
    } else {
      score = 0.5;
    }

    let displayVal;
    let explain = '';

    if (ratio >= MIN && ratio <= MAX) {
      displayVal = `Good mix: ${visImgs.length} images for your page length`;
    } else if (ratio > MAX) {
      displayVal = `Too many images: ${visImgs.length} images may be too many`;
      explain = 'Try using fewer imgs or adding more text';
    } else {
      displayVal = `Too few images: ${visImgs.length} images may not be enough`;
      explain = 'Try adding more imgs to make page more interesting';
    }

    const tableItems = [
      {
        key: 'image-count',
        itemType: 'text',
        text: `${visImgs.length} images`
      },
      {
        key: 'text-length',
        itemType: 'text',
        text: `${txtLen} text characters`
      },
      {
        key: 'ratio',
        itemType: 'text',
        text: `${ratio.toFixed(2)} images per 1000 chars`
      }
    ];

    const details = Audit.makeTableDetails(
      [
        { key: 'key', itemType: 'text', text: 'Check' },
        { key: 'text', itemType: 'text', text: 'Result' },
      ],
      tableItems
    );

    return {
      score,
      displayValue: displayVal,
      explanation: explain || undefined,
      details,
      numericValue: ratio,
      numericUnit: 'images/1000chars'
    };
  }
}

module.exports = ImageTextRatioAudit;
