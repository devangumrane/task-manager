import { useRef, useState } from "react";
import { useUploadAttachment } from "../../hooks/useAttachments";
import { Box, Typography, Button, CircularProgress } from "@mui/material";
import { UploadCloud, File as FileIcon } from "lucide-react";

export default function AttachmentUploader({ workspaceId, projectId, taskId }) {
    const fileInputRef = useRef(null);
    const [dragActive, setDragActive] = useState(false);
    const uploadMutation = useUploadAttachment(workspaceId, projectId, taskId);

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFile(e.dataTransfer.files[0]);
        }
    };

    const handleChange = (e) => {
        e.preventDefault();
        if (e.target.files && e.target.files[0]) {
            handleFile(e.target.files[0]);
        }
    };

    const handleFile = (file) => {
        if (!file) return;
        uploadMutation.mutate(file);
    };

    return (
        <Box
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            sx={{
                border: "2px dashed",
                borderColor: dragActive ? "primary.main" : "divider",
                borderRadius: 2,
                p: 3,
                textAlign: "center",
                bgcolor: dragActive ? "action.hover" : "background.paper",
                transition: "all 0.2s",
                cursor: "pointer",
                position: "relative",
            }}
            onClick={() => fileInputRef.current?.click()}
        >
            <input
                ref={fileInputRef}
                type="file"
                style={{ display: "none" }}
                onChange={handleChange}
            />

            {uploadMutation.isPending ? (
                <Box display="flex" flexDirection="column" alignItems="center" gap={1}>
                    <CircularProgress size={24} />
                    <Typography variant="body2" color="text.secondary">Uploading...</Typography>
                </Box>
            ) : (
                <>
                    <Box color={dragActive ? "primary.main" : "text.secondary"} mb={1}>
                        <UploadCloud size={32} />
                    </Box>
                    <Typography variant="body2" fontWeight="medium">
                        Click or drag file to this area to upload
                    </Typography>
                    <Typography variant="caption" color="text.secondary" display="block" mt={0.5}>
                        Support for images, pdf, docx, etc.
                    </Typography>
                </>
            )}
        </Box>
    );
}
