export function speak(text: string, options?: { rate?: number; pitch?: number }) {
  if ("speechSynthesis" in window) {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "zh-CN";
    utterance.rate = options?.rate ?? 0.9;
    utterance.pitch = options?.pitch ?? 1;
    utterance.volume = 1;
    window.speechSynthesis.speak(utterance);
  }
}

export function stopSpeaking() {
  if ("speechSynthesis" in window) {
    window.speechSynthesis.cancel();
  }
}
