---
"el-form-react-hooks": minor
"el-form-core": minor
"el-form-docs": minor
---

feat: Add comprehensive file upload support

- Add native file input support with zero configuration
- Implement file validation system with preset validators (image, document, avatar, gallery)
- Add Zod schema integration for file validation (z.instanceof(File))
- Add file management methods (addFile, removeFile, clearFiles)
- Add automatic file preview generation
- Support single and multiple file inputs
- Add file utilities (getFileInfo, getFilePreview)
- Update documentation with file upload examples
