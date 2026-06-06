import { describe, it, expect } from "vitest";
import {
  validateFile,
  validateFiles,
  createFileValidator,
  fileValidator,
  fileValidators,
} from "../fileValidators";

const file = (name: string, type: string, size = 10) =>
  new File([new ArrayBuffer(size)], name, { type });

describe("validateFile", () => {
  it("returns undefined for a valid file", () => {
    expect(
      validateFile(file("avatar.png", "image/png"), { maxSize: 100 })
    ).toBeUndefined();
  });

  it("rejects a file above maxSize", () => {
    expect(
      validateFile(file("large.png", "image/png", 200), { maxSize: 100 })
    ).toBe("File size must be less than 100 Bytes");
  });

  it("rejects a file below minSize", () => {
    expect(
      validateFile(file("small.png", "image/png", 5), { minSize: 100 })
    ).toBe("File size must be at least 100 Bytes");
  });

  it("rejects a disallowed acceptedTypes value", () => {
    expect(
      validateFile(file("photo.gif", "image/gif"), {
        acceptedTypes: ["image/png"],
      })
    ).toBe("File type image/gif is not allowed");
  });

  it("checks acceptedExtensions against the lowercased file extension", () => {
    expect(
      validateFile(file("photo.TXT", "text/plain"), {
        acceptedExtensions: ["png"],
      })
    ).toBe("File extension .txt is not allowed");

    expect(
      validateFile(file("photo.PNG", "image/png"), {
        acceptedExtensions: ["png"],
      })
    ).toBeUndefined();
  });

  it("treats maxSize: 0 as no limit because the option is falsy", () => {
    expect(
      validateFile(file("large.png", "image/png", 999), { maxSize: 0 })
    ).toBeUndefined();
  });

  it("treats minSize: 0 as no limit because the option is falsy", () => {
    expect(
      validateFile(file("empty.png", "image/png", 0), { minSize: 0 })
    ).toBeUndefined();
  });
});

describe("validateFiles", () => {
  it("rejects more than maxFiles", () => {
    expect(
      validateFiles(
        [file("a.png", "image/png"), file("b.png", "image/png")],
        { maxFiles: 1 }
      )
    ).toBe("Maximum 1 files allowed");
  });

  it("rejects fewer than minFiles", () => {
    expect(validateFiles([file("a.png", "image/png")], { minFiles: 2 })).toBe(
      "Minimum 2 files required"
    );
  });

  it("returns the first failing per-file validation message", () => {
    expect(
      validateFiles(
        [
          file("notes.txt", "text/plain", 10),
          file("large.png", "image/png", 999),
        ],
        { maxSize: 100, acceptedTypes: ["image/png"] }
      )
    ).toBe("File type text/plain is not allowed");
  });

  it("accepts File[] values within limits", () => {
    expect(
      validateFiles([file("a.png", "image/png")], { maxFiles: 2 })
    ).toBeUndefined();
  });

  it("treats maxFiles: 0 as no limit because the option is falsy", () => {
    expect(
      validateFiles(
        [file("a.png", "image/png"), file("b.png", "image/png")],
        { maxFiles: 0 }
      )
    ).toBeUndefined();
  });
});

describe("createFileValidator / fileValidator", () => {
  it("returns undefined for a falsy value", () => {
    expect(createFileValidator({ maxSize: 1 })({ value: null } as any)).toBe(
      undefined
    );
  });

  it("validates a single File value", () => {
    expect(
      createFileValidator({ maxSize: 5 })({
        value: file("large.png", "image/png", 99),
      } as any)
    ).toBe("File size must be less than 5 Bytes");
  });

  it("validates File[] values through the array branch", () => {
    const validator = createFileValidator({ maxFiles: 1 });

    expect(
      validator({
        value: [file("a.png", "image/png"), file("b.png", "image/png")],
      } as any)
    ).toBe("Maximum 1 files allowed");
  });

  it("returns undefined for a non-file value", () => {
    expect(
      createFileValidator({ maxSize: 1 })({ value: "hello" } as any)
    ).toBeUndefined();
  });

  it("returns undefined for non-file values when File globals are unavailable", () => {
    const hadFile = "File" in globalThis;
    const hadFileList = "FileList" in globalThis;
    const originalFile = (globalThis as any).File;
    const originalFileList = (globalThis as any).FileList;

    try {
      delete (globalThis as any).File;
      delete (globalThis as any).FileList;

      expect(
        createFileValidator({ maxSize: 1 })({ value: "hello" } as any)
      ).toBeUndefined();
    } finally {
      if (hadFile) (globalThis as any).File = originalFile;
      if (hadFileList) (globalThis as any).FileList = originalFileList;
    }
  });

  it("fileValidator returns a validator function", () => {
    expect(typeof fileValidator({ maxSize: 1 })).toBe("function");
  });

  // FileList is browser-only and is not constructible in this node test.
  // The File[] case above pins the array path; browser coverage should exercise FileList.
});

describe("fileValidators presets", () => {
  it("image accepts png and rejects text", () => {
    expect(
      fileValidators.image({ value: file("photo.png", "image/png") } as any)
    ).toBeUndefined();
    expect(
      fileValidators.image({ value: file("notes.txt", "text/plain") } as any)
    ).toBe("File type text/plain is not allowed");
  });

  it("avatar rejects two files", () => {
    expect(
      fileValidators.avatar({
        value: [file("a.png", "image/png"), file("b.png", "image/png")],
      } as any)
    ).toBe("Maximum 1 files allowed");
  });

  it("document accepts pdf and rejects image", () => {
    expect(
      fileValidators.document({
        value: file("paper.pdf", "application/pdf"),
      } as any)
    ).toBeUndefined();
    expect(
      fileValidators.document({ value: file("photo.png", "image/png") } as any)
    ).toBe("File type image/png is not allowed");
  });

  it("gallery accepts a valid image sample", () => {
    expect(
      fileValidators.gallery({
        value: [file("photo.png", "image/png")],
      } as any)
    ).toBeUndefined();
  });

  it("video accepts a valid sample", () => {
    expect(
      fileValidators.video({ value: file("clip.mp4", "video/mp4") } as any)
    ).toBeUndefined();
  });

  it("audio accepts a valid sample", () => {
    expect(
      fileValidators.audio({ value: file("sound.mp3", "audio/mpeg") } as any)
    ).toBeUndefined();
  });
});
