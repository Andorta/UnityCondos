package com.mgmt.residency.entity;

import java.util.Base64;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Lob;
import jakarta.persistence.Table;

@Entity
@Table(name = "file_metadata")
public class FileMetadata {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Column(name = "file_name")
	private String fileName;

	@Lob
	@Column(name = "receipt_file", columnDefinition = "LONGBLOB")
	private byte[] receiptFile;

	@Column(name = "file_type")
	private String fileType;

	@Column(name = "file_size")
	private Long fileSize;

	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public String getFileName() {
		return fileName;
	}

	public void setFileName(String fileName) {
		this.fileName = fileName;
	}

	public String getReceiptFile() {
		if (receiptFile != null && fileType != null) {
			String mimeType = switch (fileType.toLowerCase()) {
			case "pdf", "application/pdf" -> "application/pdf";
			case "jpeg", "jpg" -> "image/jpeg";
			case "png" -> "image/png";
			default -> fileType;
			};

			String base64 = Base64.getEncoder().encodeToString(receiptFile);
			return "data:" + mimeType + ";base64," + base64;
		}
		return null;
	}

	public void setReceiptFile(byte[] receiptFile) {
		this.receiptFile = receiptFile;
	}

	public String getFileType() {
		return fileType;
	}

	public void setFileType(String fileType) {
		this.fileType = fileType;
	}

	public Long getFileSize() {
		return fileSize;
	}

	public void setFileSize(Long fileSize) {
		this.fileSize = fileSize;
	}

}
