const Audit = require('lighthouse').Audit;

// check headings structure
class HeadingCheckAudit extends Audit {
  static get meta() {
    return {
      id: 'heading-check',
      title: 'Page uses headings correctly',
      failureTitle: 'Page headings need improvement',
      description: 'Good headings help ppl scan ur page. Use one H1 for title, H2 for sections, H3 for smaller bits.',
      requiredArtifacts: ['HeadingElements']
    };
  }

  static audit(artifacts) {
    const headings = artifacts.HeadingElements || [];

    if (headings.length === 0) {
      return {
        score: 0,
        explanation: 'No headings found on page',
        displayValue: 'No headings found'
      };
    }

    const h1s = headings.filter(h => h.tagName === 'H1');
    const hasH1 = h1s.length > 0;
    const tooManyH1s = h1s.length > 1;

    // check if order makes sense
    let inOrder = true;
    let lastLvl = 0;
    let skipped = [];

    headings.forEach(h => {
      const lvl = parseInt(h.tagName.substring(1), 10);

      if (lvl > lastLvl + 1 && lastLvl > 0) {
        inOrder = false;
        skipped.push(`H${lastLvl} to H${lvl}`);
      }

      lastLvl = lvl;
    });

    // count headings by type
    const counts = {};
    headings.forEach(h => {
      const type = h.tagName;
      counts[type] = (counts[type] || 0) + 1;
    });

    const tableItems = Object.entries(counts).map(([type, num]) => ({
      key: type.toLowerCase(),
      itemType: 'text',
      text: `${num} ${type} heading${num === 1 ? '' : 's'}`
    }));

    // calc score
    let score = 1.0;

    if (!hasH1) score -= 0.4;  // no H1
    if (tooManyH1s) score -= 0.2;  // too many H1s
    if (!inOrder) score -= 0.3;  // skipped levels

    if (score < 0) score = 0;

    let probs = [];
    if (!hasH1) probs.push('Missing H1 heading');
    if (tooManyH1s) probs.push(`${h1s.length} H1 headings (should be 1)`);
    if (!inOrder) probs.push('Skipped heading levels');

    const displayValue = probs.length > 0
      ? `Problems: ${probs.join(', ')}`
      : `Good heading structure with ${headings.length} headings`;

    const details = Audit.makeTableDetails(
      [
        { key: 'key', itemType: 'text', text: 'Heading Type' },
        { key: 'text', itemType: 'text', text: 'Count' },
      ],
      tableItems
    );

    return {
      score,
      displayValue,
      details
    };
  }
}

module.exports = HeadingCheckAudit;
