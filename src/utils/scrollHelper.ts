export function hideHtmlScroll() {
  if (document.getElementsByTagName('html')[0].style.overflow !== 'hidden') {
    document.getElementsByTagName('html')[0].style.overflow = 'hidden'
  }
}
export function showHtmlScroll() {
  if (document.getElementsByTagName('html')[0].style.overflow !== 'auto') {
    document.getElementsByTagName('html')[0].style.overflow = 'auto'
  }
}
