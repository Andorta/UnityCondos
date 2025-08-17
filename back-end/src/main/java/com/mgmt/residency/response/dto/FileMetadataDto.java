package com.mgmt.residency.response.dto;

public class FileMetadataDto {
	private Long id;
	private String fileName;
	private String receiptFile;
	private String fileType;
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
		return receiptFile;
	}

	public void setReceiptFile(String receiptFile) {
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
