const Audit = require('lighthouse').Audit;
const { getMainText } = require('../utils/textanalyzer');

// check if page has enough words
class ContentLengthAudit extends Audit {
  static get meta() {
    return {
      id: 'content-length',
      title: 'Page has enough words',
      failureTitle: 'Page doesn\'t have enough words',
      description: 'Pages with more words rank better. Try for 300+ words on main pages.',
      requiredArtifacts: ['FullPageScreenshot', 'URL', 'MainDocumentContent']
    };
  }

  static audit(artifacts) {
    const mainContent = artifacts.MainDocumentContent || '';
    const text = getMainText(mainContent);

    const wordCnt = text.split(/\s+/).filter(Boolean).length;

    const MIN = 300;
    const BEST = 600;

    let score;
    if (wordCnt >= BEST) {
      score = 1;
    } else if (wordCnt >= MIN) {
      score = 0.5 + ((wordCnt - MIN) / (BEST - MIN) * 0.4);
    } else {
      score = wordCnt / MIN * 0.5;
    }

    let displayVal;
    if (wordCnt >= BEST) {
      displayVal = `Your page has ${wordCnt} words (Great!)`;
    } else if (wordCnt >= MIN) {
      displayVal = `Your page has ${wordCnt} words (OK)`;
    } else {
      displayVal = `Your page has only ${wordCnt} words (Not enough)`;
    }

    const tableItems = [
      {
        key: 'word-count',
        itemType: 'text',
        text: `${wordCnt} words`
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
      details,
      numericValue: wordCnt,
      numericUnit: 'words'
    };
  }
}

module.exports = ContentLengthAudit;
