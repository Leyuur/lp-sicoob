export const smoothScrollTo = (elementId, offset = 80) => {
  const element = document.getElementById(elementId)
  if (element) {
    const headerOffset = offset
    const elementPosition = element.getBoundingClientRect().top
    const offsetPosition = elementPosition + window.pageYOffset - headerOffset
    const startPosition = window.pageYOffset
    const distance = offsetPosition - startPosition
    const duration = 800
    let start = null

    const animation = (currentTime) => {
      if (start === null) start = currentTime
      const timeElapsed = currentTime - start
      const run = ease(timeElapsed, startPosition, distance, duration)
      window.scrollTo(0, run)
      if (timeElapsed < duration) requestAnimationFrame(animation)
    }

    const ease = (t, b, c, d) => {
      t /= d / 2
      if (t < 1) return c / 2 * t * t + b
      t--
      return -c / 2 * (t * (t - 2) - 1) + b
    }

    requestAnimationFrame(animation)
  }
}
