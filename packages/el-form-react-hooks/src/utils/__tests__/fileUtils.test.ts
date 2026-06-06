import { afterEach, describe, expect, it, vi } from "vitest";
import {
  formatFileSize,
  getFileExtension,
  getFileInfo,
  getFilePreview,
} from "../fileUtils";

const file = (name: string, type: string, size = 10) =>
  new File([new ArrayBuffer(size)], name, { type });

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("formatFileSize", () => {
  it("formats zero bytes", () => {
    expect(formatFileSize(0)).toBe("0 Bytes");
  });

  it("formats raw byte counts", () => {
    expect(formatFileSize(512)).toBe("512 Bytes");
  });

  it("formats kilobytes, megabytes, and gigabytes", () => {
    expect(formatFileSize(1024)).toBe("1 KB");
    expect(formatFileSize(1024 * 1024)).toBe("1 MB");
    expect(formatFileSize(1024 * 1024 * 1024)).toBe("1 GB");
  });

  it("rounds converted sizes to two decimals", () => {
    expect(formatFileSize(1234)).toBe("1.21 KB");
    expect(formatFileSize(2.345 * 1024 * 1024)).toBe("2.35 MB");
  });
});

describe("getFileExtension", () => {
  it("returns a normal extension", () => {
    expect(getFileExtension("avatar.png")).toBe("png");
  });

  it("returns the last segment for multi-dot file names", () => {
    expect(getFileExtension("archive.tar.gz")).toBe("gz");
  });

  it("pins dotfiles and names without extensions to an empty extension", () => {
    // Current public behavior: dotfiles and no-dot names have no extension.
    // Changing this would affect getFileInfo().extension as well.
    expect(getFileExtension(".gitignore")).toBe("");
    expect(getFileExtension("README")).toBe("");
  });
});

describe("getFileInfo", () => {
  it("returns public file metadata and derived fields", () => {
    const image = file("profile.photo.png", "image/png", 1536);

    expect(getFileInfo(image)).toEqual({
      name: "profile.photo.png",
      size: 1536,
      type: "image/png",
      lastModified: image.lastModified,
      formattedSize: "1.5 KB",
      isImage: true,
      extension: "png",
    });
  });

  it("marks non-image files as not images", () => {
    expect(getFileInfo(file("report.pdf", "application/pdf")).isImage).toBe(false);
  });
});

describe("getFilePreview", () => {
  it("returns null for non-image files", async () => {
    await expect(getFilePreview(file("report.pdf", "application/pdf"))).resolves.toBe(
      null
    );
  });

  it("returns a data URL for image files", async () => {
    const dataUrl = "data:image/png;base64,cHJldmlldw==";
    const image = file("avatar.png", "image/png");
    let readFile: File | null = null;

    class MockFileReader {
      onload: ((event: { target?: { result: string } }) => void) | null = null;
      onerror: (() => void) | null = null;

      readAsDataURL(file: File) {
        readFile = file;
        this.onload?.({ target: { result: dataUrl } });
      }
    }

    vi.stubGlobal("FileReader", MockFileReader);

    await expect(getFilePreview(image)).resolves.toBe(dataUrl);
    expect(readFile).toBe(image);
  });

  it("returns null when the image reader errors", async () => {
    class MockFileReader {
      onload: ((event: { target?: { result: string } }) => void) | null = null;
      onerror: (() => void) | null = null;

      readAsDataURL(_file: File) {
        this.onerror?.();
      }
    }

    vi.stubGlobal("FileReader", MockFileReader);

    await expect(getFilePreview(file("avatar.png", "image/png"))).resolves.toBe(
      null
    );
  });
});
