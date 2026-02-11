export const Analytics = {

  formatDate(isoString) {
    return new Date(isoString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  },

  calculateConversionRate(submissions, pageViews) {
    if (pageViews === 0) return 0
    return ((submissions / pageViews) * 100).toFixed(2)
  },

  aggregateByShift(data) {
    return data.reduce((acc, item) => {
      const shift = item.selected_shift
      if (!acc[shift]) {
        acc[shift] = {
          shift,
          count: 0,
          bySource: {}
        }
      }
      acc[shift].count++
      acc[shift].bySource[item.source_campaign] = (acc[shift].bySource[item.source_campaign] || 0) + 1
      return acc
    }, {})
  },

  aggregateBySource(data) {
    return data.reduce((acc, item) => {
      const source = item.source_campaign || 'direct'
      if (!acc[source]) {
        acc[source] = {
          source,
          total: 0,
          byShift: {},
          avgTimeToApply: 0,
          qualityScore: 0
        }
      }
      acc[source].total++
      const shift = item.selected_shift
      acc[source].byShift[shift] = (acc[source].byShift[shift] || 0) + 1
      return acc
    }, {})
  },

  aggregateByDate(data) {
    return data.reduce((acc, item) => {
      const date = item.created_at.split('T')[0]
      if (!acc[date]) {
        acc[date] = {
          date,
          submissions: 0,
          experiences: {}
        }
      }
      acc[date].submissions++
      const exp = item.experience
      acc[date].experiences[exp] = (acc[date].experiences[exp] || 0) + 1
      return acc
    }, {})
  },

  aggregateByLocation(data) {
    return data.reduce((acc, item) => {
      const location = `${item.city}, ${item.state}`
      if (!acc[location]) {
        acc[location] = {
          location,
          count: 0,
          preferences: []
        }
      }
      acc[location].count++
      acc[location].preferences.push(item.employment_type)
      return acc
    }, {})
  },

  getTopLocations(locationData, limit = 5) {
    return Object.values(locationData)
      .sort((a, b) => b.count - a.count)
      .slice(0, limit)
  },

  getTopShifts(shiftData, limit = 5) {
    return Object.values(shiftData)
      .sort((a, b) => b.count - a.count)
      .slice(0, limit)
  },

  calculateQualityScore(experience) {
    const scores = {
      'No Experience': 6,
      'Entry Level': 7,
      'Intermediate': 8,
      'Experienced': 9
    }
    return scores[experience] || 5
  },

  getMetricsSummary(data) {
    const total = data.length
    const byStatus = data.reduce((acc, item) => {
      acc[item.submission_status] = (acc[item.submission_status] || 0) + 1
      return acc
    }, {})

    const byExperience = data.reduce((acc, item) => {
      acc[item.experience] = (acc[item.experience] || 0) + 1
      return acc
    }, {})

    const byEmploymentType = data.reduce((acc, item) => {
      acc[item.employment_type] = (acc[item.employment_type] || 0) + 1
      return acc
    }, {})

    return {
      totalApplications: total,
      byStatus,
      byExperience,
      byEmploymentType,
      avgQualityScore: (data.reduce((sum, item) => sum + this.calculateQualityScore(item.experience), 0) / total).toFixed(1)
    }
  }
}
