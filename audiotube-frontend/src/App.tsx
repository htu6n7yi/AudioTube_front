import { useState } from "react";
import type { CSSProperties, KeyboardEvent } from "react";

// URL da API vinda do arquivo .env (VITE_API_URL=https://sua-api.onrender.com)
const API_URL = import.meta.env.VITE_API_URL as string;

// Tipagem da resposta da API
interface DownloadResponse {
  mensagem: string;
  arquivo: string;
}

// Extrai o ID do vídeo do YouTube a partir da URL
function extractVideoId(url: string): string | null {
  const match = url.match(
    /(?:youtube\.com\/(?:watch\?v=|shorts\/|embed\/)|youtu\.be\/)([\w-]{11})/
  );
  return match ? match[1] : null;
}

export default function App() {
  const [url, setUrl] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<DownloadResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const videoId = extractVideoId(url);
  const thumbnailUrl = videoId
    ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
    : null;

  async function handleDownload(): Promise<void> {
    if (!url.trim()) return;

    setLoading(true);
    setResult(null);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/download-audio`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });

      const data: DownloadResponse & { detail?: string } = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Erro ao processar o download.");
      }

      setResult(data);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Não foi possível conectar à API.");
      }
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>): void {
    if (e.key === "Enter") handleDownload();
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        {/* Header */}
        <div style={styles.header}>
          <span style={styles.icon}>♫</span>
          <h1 style={styles.title}>AudioTube</h1>
          <p style={styles.subtitle}>Cole o link do YouTube e baixe o áudio em MP3</p>
        </div>

        {/* Input */}
        <div style={styles.inputRow}>
          <input
            style={styles.input}
            type="text"
            placeholder="https://www.youtube.com/watch?v=..."
            value={url}
            onChange={(e) => {
              setUrl(e.target.value);
              setResult(null);
              setError(null);
            }}
            onKeyDown={handleKeyDown}
            disabled={loading}
          />
          <button
            style={{
              ...styles.button,
              ...(loading ? styles.buttonDisabled : {}),
            }}
            onClick={handleDownload}
            disabled={loading || !url.trim()}
          >
            {loading ? <span style={styles.spinner} /> : "Baixar"}
          </button>
        </div>

        {/* Thumbnail preview */}
        {thumbnailUrl && !result && !error && (
          <div style={styles.preview}>
            <img
              src={thumbnailUrl}
              alt="Thumbnail do vídeo"
              style={styles.thumbnail}
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
            <p style={styles.previewLabel}>Prévia do vídeo</p>
          </div>
        )}

        {/* Erro */}
        {error && (
          <div style={styles.errorBox}>
            <span style={styles.errorIcon}>✕</span>
            <span>{error}</span>
          </div>
        )}

        {/* Sucesso */}
        {result && (
          <div style={styles.successBox}>
            <span style={styles.successIcon}>✓</span>
            <div>
              <p style={styles.successMsg}>{result.mensagem}</p>
              <p style={styles.successFile}>{result.arquivo}</p>
            </div>
          </div>
        )}
      </div>

      <p style={styles.footer}>Apenas para fins de estudo 🎓</p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Estilos tipados como CSSProperties para compatibilidade com TypeScript
// ---------------------------------------------------------------------------
const styles: Record<string, CSSProperties> = {
  page: {
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    background: "#f7f7f5",
    fontFamily: "'Georgia', serif",
    padding: "24px",
    boxSizing: "border-box",
  },
  card: {
    background: "#ffffff",
    borderRadius: "16px",
    padding: "40px 36px",
    width: "100%",
    maxWidth: "520px",
    boxShadow: "0 4px 32px rgba(0,0,0,0.08)",
    boxSizing: "border-box",
  },
  header: {
    textAlign: "center",
    marginBottom: "32px",
  },
  icon: {
    fontSize: "36px",
    display: "block",
    marginBottom: "8px",
  },
  title: {
    margin: "0 0 8px",
    fontSize: "28px",
    fontWeight: "700",
    color: "#1a1a1a",
    letterSpacing: "-0.5px",
  },
  subtitle: {
    margin: 0,
    fontSize: "14px",
    color: "#888",
    fontFamily: "sans-serif",
  },
  inputRow: {
    display: "flex",
    gap: "10px",
    marginBottom: "20px",
  },
  input: {
    flex: 1,
    padding: "12px 14px",
    fontSize: "14px",
    border: "1.5px solid #e0e0e0",
    borderRadius: "10px",
    outline: "none",
    fontFamily: "sans-serif",
    color: "#1a1a1a",
    background: "#fafafa",
  },
  button: {
    padding: "12px 22px",
    fontSize: "14px",
    fontWeight: "600",
    background: "#1a1a1a",
    color: "#fff",
    border: "none",
    borderRadius: "10px",
    cursor: "pointer",
    fontFamily: "sans-serif",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    minWidth: "80px",
  },
  buttonDisabled: {
    opacity: 0.5,
    cursor: "not-allowed",
  },
  spinner: {
    width: "16px",
    height: "16px",
    border: "2px solid rgba(255,255,255,0.4)",
    borderTopColor: "#fff",
    borderRadius: "50%",
    display: "inline-block",
  },
  preview: {
    textAlign: "center",
    marginBottom: "16px",
  },
  thumbnail: {
    width: "100%",
    borderRadius: "10px",
    objectFit: "cover",
    maxHeight: "200px",
  },
  previewLabel: {
    marginTop: "8px",
    fontSize: "12px",
    color: "#aaa",
    fontFamily: "sans-serif",
  },
  errorBox: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    background: "#fff5f5",
    border: "1.5px solid #fdd",
    borderRadius: "10px",
    padding: "14px 16px",
    fontSize: "14px",
    color: "#c0392b",
    fontFamily: "sans-serif",
  },
  errorIcon: {
    fontWeight: "700",
    fontSize: "16px",
  },
  successBox: {
    display: "flex",
    alignItems: "flex-start",
    gap: "12px",
    background: "#f0fff4",
    border: "1.5px solid #b2f0cb",
    borderRadius: "10px",
    padding: "14px 16px",
    fontFamily: "sans-serif",
  },
  successIcon: {
    fontSize: "18px",
    color: "#27ae60",
    fontWeight: "700",
    marginTop: "1px",
  },
  successMsg: {
    margin: "0 0 4px",
    fontSize: "14px",
    fontWeight: "600",
    color: "#1a1a1a",
  },
  successFile: {
    margin: 0,
    fontSize: "12px",
    color: "#555",
    wordBreak: "break-all",
  },
  footer: {
    marginTop: "24px",
    fontSize: "12px",
    color: "#bbb",
    fontFamily: "sans-serif",
  },
};