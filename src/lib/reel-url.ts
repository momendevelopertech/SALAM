export function reelEmbedSrc(url: string) {
  const base = "https://www.facebook.com/plugins/video.php";
  return `${base}?href=${encodeURIComponent(url)}&show_text=false&width=560`;
}
