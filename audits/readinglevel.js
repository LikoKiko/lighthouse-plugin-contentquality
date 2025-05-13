const Audit = require('lighthouse').Audit;
const { getMainText, checkReadingLevel } = require('../utils/textanalyzer');

// check if txt is ez to read
class ReadingLevelAudit extends Audit {
  static get meta() {
    return {
      id: 'reading-level',
      title: 'Text is easy to read',
      failureTitle: 'Text might be too hard to read',
      description: 'Most ppl like text at a middle school lvl. Simple = better.',
      requiredArtifacts: ['FullPageScreenshot', 'URL', 'MainDocumentContent']
    };
  }

  static audit(artifacts) {
    const mainContent = artifacts.MainDocumentContent || '';
    const text = getMainText(mainContent);

    if (text.length < 200) {
      return {
        score: null,
        notApplicable: true,
        explanation: 'Not enough text to check'
      };
    }

    const scores = checkReadingLevel(text);
    const { easyToReadScore, gradeLevel } = scores;

    let score;
    if (easyToReadScore >= 60 && easyToReadScore <= 80) {
      score = 1; // just right
    } else if (easyToReadScore > 80) {
      score = 0.9; // too simple
    } else if (easyToReadScore >= 50) {
      score = 0.8; // bit hard
    } else if (easyToReadScore >= 40) {
      score = 0.6; // too hard
    } else if (easyToReadScore >= 30) {
      score = 0.4; // very hard
    } else {
      score = 0.2; // unreadable
    }

    const gradeTxt = gradeLevel !== null
      ? gradeLevel.toFixed(1)
      : 'Unknown';

    let readLvl;
    if (easyToReadScore >= 90) readLvl = 'Very Easy';
    else if (easyToReadScore >= 80) readLvl = 'Easy';
    else if (easyToReadScore >= 70) readLvl = 'Fairly Easy';
    else if (easyToReadScore >= 60) readLvl = 'Standard';
    else if (easyToReadScore >= 50) readLvl = 'Fairly Hard';
    else if (easyToReadScore >= 30) readLvl = 'Hard';
    else readLvl = 'Very Hard';

    const displayVal = `Reading level: ${readLvl} (Grade ${gradeTxt})`;

    const tableItems = [
      {
        key: 'easy-to-read-score',
        itemType: 'text',
        text: `${easyToReadScore !== null ? easyToReadScore.toFixed(1) : 'N/A'} (${readLvl})`
      },
      {
        key: 'grade-level',
        itemType: 'text',
        text: `Grade ${gradeTxt}`
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
      numericValue: easyToReadScore,
      numericUnit: 'reading score'
    };
  }
}

module.exports = ReadingLevelAudit;
