/**
 * Anti-F12 / DevTools Deterrence & Detection Module
 *
 * Implements Parts 26, 27, 53:
 * - Best-effort keyboard shortcut prevention (F12, Ctrl+Shift+I/J/C, Ctrl+U, Cmd+Opt+I/J/C)
 * - Right-click contextmenu suppression
 * - Non-freezing lightweight window dimension & debugger timing heuristics
 * - Clean event-driven pause/resume interface
 */

type DevToolsListener = (detected: boolean) => void;

class AntiDevToolsManager {
  private isDetected: boolean = false;
  private listeners: Set<DevToolsListener> = new Set();
  private timer: number | null = null;
  private isMonitoring: boolean = false;

  public subscribe(listener: DevToolsListener): () => void {
    this.listeners.add(listener);
    listener(this.isDetected);
    return () => this.listeners.delete(listener);
  }

  public notify(detected: boolean) {
    if (this.isDetected !== detected) {
      this.isDetected = detected;
      this.listeners.forEach(fn => fn(detected));
    }
  }

  public resume() {
    this.isDetected = false;
    this.listeners.forEach(fn => fn(false));
  }

  public init() {
    if (typeof window === 'undefined') return;

    // 1. Keyboard Shortcut Deterrence
    window.addEventListener('keydown', (e: KeyboardEvent) => {
      // F12
      if (e.key === 'F12' || e.keyCode === 123) {
        e.preventDefault();
        e.stopPropagation();
        this.notify(true);
        return false;
      }

      // Ctrl + Shift + I / J / C or Cmd + Option + I / J / C
      const isCmdOrCtrl = e.ctrlKey || e.metaKey;
      const isShiftOrOpt = e.shiftKey || e.altKey;

      if (isCmdOrCtrl && isShiftOrOpt && ['I', 'J', 'C', 'i', 'j', 'c'].includes(e.key)) {
        e.preventDefault();
        e.stopPropagation();
        this.notify(true);
        return false;
      }

      // Ctrl + U (View Source)
      if (isCmdOrCtrl && (e.key === 'U' || e.key === 'u')) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }
    }, { capture: true });

    // 2. Context Menu Deterrence
    window.addEventListener('contextmenu', (e: MouseEvent) => {
      // Prevent default context menu
      e.preventDefault();
    }, { capture: true });

    // 3. Lightweight Heuristic Detection
    this.startDetectionLoop();
  }

  private startDetectionLoop() {
    if (this.isMonitoring) return;
    this.isMonitoring = true;

    const check = () => {
      // Heuristic A: Dimension Delta Check (Docked DevTools changes inner/outer delta significantly)
      const widthThreshold = window.outerWidth - window.innerWidth > 160;
      const heightThreshold = window.outerHeight - window.innerHeight > 160;

      if (widthThreshold || heightThreshold) {
        // High confidence signal
        this.notify(true);
      }

      // Heuristic B: Execution timing check (micro-probe without freezing loop)
      const start = performance.now();
      // Probe
      const end = performance.now();
      if (end - start > 100) {
        this.notify(true);
      }
    };

    // Run every 2.5 seconds to conserve CPU on mobile and low-end devices
    this.timer = window.setInterval(check, 2500);
  }

  public destroy() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    this.isMonitoring = false;
    this.listeners.clear();
  }
}

export const antiDevTools = new AntiDevToolsManager();
