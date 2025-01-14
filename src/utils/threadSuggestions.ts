interface ThreadSegment {
  content: string
  charCount: number
  wordCount: number
}

interface ThreadAnalysis {
  segments: ThreadSegment[]
  totalChars: number
  totalWords: number
  isThreadRecommended: boolean
}

// Natural breakpoints in text that would make good thread segments
const NATURAL_BREAKS = [
  '\n\n',   // Double line break
  '. ',     // End of sentence
  '! ',     // Exclamation
  '? ',     // Question
  ': ',     // Colon
  ';\n',    // Semicolon with newline
  '.\n',    // Period with newline
  '!\n',    // Exclamation with newline
  '?\n',    // Question with newline
]

export function analyzeForThread(content: string, maxChars: number = 280): ThreadAnalysis {
  // Quick check if thread is needed
  if (content.length <= maxChars) {
    return {
      segments: [{ content, charCount: content.length, wordCount: content.split(/\s+/).length }],
      totalChars: content.length,
      totalWords: content.split(/\s+/).length,
      isThreadRecommended: false
    }
  }

  const segments: ThreadSegment[] = []
  let currentContent = content
  let totalChars = 0
  let totalWords = 0

  while (currentContent.length > 0) {
    let breakPoint = maxChars

    // Don't break in the middle of a word if possible
    if (breakPoint < currentContent.length) {
      // Look for natural breaks first
      let naturalBreak = -1
      for (const breakChar of NATURAL_BREAKS) {
        const lastBreak = currentContent.lastIndexOf(breakChar, maxChars)
        if (lastBreak > naturalBreak) {
          naturalBreak = lastBreak + breakChar.length
        }
      }

      // If found a natural break, use it
      if (naturalBreak > 0) {
        breakPoint = naturalBreak
      } else {
        // Otherwise break at last space before limit
        const lastSpace = currentContent.lastIndexOf(' ', maxChars)
        if (lastSpace > 0) {
          breakPoint = lastSpace + 1
        }
      }
    }

    const segment = currentContent.slice(0, breakPoint).trim()
    const words = segment.split(/\s+/).filter(Boolean)
    
    segments.push({
      content: segment,
      charCount: segment.length,
      wordCount: words.length
    })

    totalChars += segment.length
    totalWords += words.length
    currentContent = currentContent.slice(breakPoint).trim()
  }

  return {
    segments,
    totalChars,
    totalWords,
    isThreadRecommended: segments.length > 1
  }
}

export function suggestThreadStructure(content: string): ThreadAnalysis {
  const analysis = analyzeForThread(content)
  
  // Additional logic for thread suggestions
  if (analysis.isThreadRecommended) {
    // Number each segment
    analysis.segments = analysis.segments.map((segment, index) => ({
      ...segment,
      content: `${index + 1}/${analysis.segments.length} ${segment.content}`
    }))
  }

  return analysis
}

export function formatThreadPreview(analysis: ThreadAnalysis): string {
  if (!analysis.isThreadRecommended) {
    return analysis.segments[0].content
  }

  return analysis.segments
    .map((segment, index) => 
      `Tweet ${index + 1}/${analysis.segments.length}:\n${segment.content}\n`
    )
    .join('\n')
}

export function getThreadStats(analysis: ThreadAnalysis) {
  return {
    tweetCount: analysis.segments.length,
    averageLength: Math.round(analysis.totalChars / analysis.segments.length),
    totalWords: analysis.totalWords,
    readingTime: Math.ceil(analysis.totalWords / 200) // Average reading speed
  }
}