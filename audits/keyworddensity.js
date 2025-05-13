const Audit = require('lighthouse').Audit;
const { getMainText, checkTopWords } = require('../utils/textanalyzer');

// check keyword usage
class KeywordCheckAudit extends Audit {
  static get meta() {
    return {
      id: 'keyword-check',
      title: 'Page uses important words well',
      failureTitle: 'Page could use important words better',
      description: 'Words from title should be in text. Helps Google understand what page is about.',
      requiredArtifacts: ['FullPageScreenshot', 'URL', 'MainDocumentContent', 'Title', 'MetaElements']
    };
  }

  static audit(artifacts) {
    const mainContent = artifacts.MainDocumentContent || '';
    const text = getMainText(mainContent);
    const title = artifacts.Title || '';

    const metaElems = artifacts.MetaElements || [];
    const metaDesc = metaElems.find(meta =>
      meta.name && meta.name.toLowerCase() === 'description'
    )?.content || '';

    if (text.length < 200) {
      return {
        score: null,
        notApplicable: true,
        explanation: 'Not enough text to check keywords'
      };
    }

    const titleWords = title.toLowerCase()
      .match(/\b[a-z]{4,}\b/g) || [];

    const wordAnalysis = checkTopWords(text);
    const { topWords, totalWords } = wordAnalysis;

    const titleWordsFound = titleWords.filter(word =>
      topWords.some(k => k.word === word)
    );

    const topWordsText = topWords.map(k =>
      `${k.word} (${k.count} times, ${k.percent})`
    ).join(', ');

    let hasGoodWordUse = false;
    if (topWords.length > 0) {
      const firstWordPct = parseFloat(topWords[0].percent);
      hasGoodWordUse = firstWordPct >= 1 && firstWordPct <= 3;
    }

    let score = 0;

    if (titleWordsFound.length > 0) {
      score += 0.6;
    }

    if (hasGoodWordUse) {
      score += 0.3;
    }

    if (totalWords >= 300) {
      score += 0.1;
    }

    if (score > 1) score = 1;

    let displayVal = `Found ${topWords.length} important words`;
    if (titleWordsFound.length > 0) {
      displayVal += `, ${titleWordsFound.length} from title`;
    }

    const tableItems = [
      {
        key: 'top-words',
        itemType: 'text',
        text: topWordsText || 'No important words found'
      },
      {
        key: 'title-words-found',
        itemType: 'text',
        text: titleWordsFound.length > 0
          ? `${titleWordsFound.join(', ')}`
          : 'No title words found in content'
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
      details
    };
  }
}

module.exports = KeywordCheckAudit;
