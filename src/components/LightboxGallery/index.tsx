import * as React from "react";
import {
  Modal,
  Backdrop,
  Box,
  IconButton,
  Fade,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";

interface LightboxGalleryProps {
  items: { src: string; type?: "image" | "video"; alt?: string }[];
  openIndex: number | null;
  onClose: () => void;
}

export default function LightboxGallery({
  items,
  openIndex,
  onClose,
}: LightboxGalleryProps) {
  const [index, setIndex] = React.useState<number>(openIndex ?? 0);
  const [hoverZone, setHoverZone] = React.useState<
    "left" | "right" | "bg" | null
  >(null);
  const [isLeftHovered, setIsLeftHovered] = React.useState(false);
  const [isRightHovered, setIsRightHovered] = React.useState(false);

  React.useEffect(() => {
    if (openIndex !== null) setIndex(openIndex);
  }, [openIndex]);

  const handlePrev = React.useCallback(
    () => setIndex((i) => (i - 1 + items.length) % items.length),
    [items.length]
  );
  const handleNext = React.useCallback(
    () => setIndex((i) => (i + 1) % items.length),
    [items.length]
  );

  const handleKeyDown = React.useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") handlePrev();
      else if (e.key === "ArrowRight") handleNext();
      else if (e.key === "Escape") onClose();
    },
    [handlePrev, handleNext, onClose]
  );

  React.useEffect(() => {
    if (openIndex !== null) window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [openIndex, handleKeyDown]);

  const item = items[index];

  return (
    <Modal
      open={openIndex !== null}
      onClose={onClose}
      closeAfterTransition
      slots={{ backdrop: Backdrop }}
      slotProps={{
        backdrop: { timeout: 300, sx: { bgcolor: "rgba(0,0,0,0.9)" } },
      }}
    >
      <Fade in={openIndex !== null}>
        <Box
          data-role="backdrop"
          sx={{
            position: "fixed",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            p: 2,
            cursor: hoverZone === "bg" ? "pointer" : "default",
          }}
          onMouseMove={(e) => {
            const target = e.target as HTMLElement;
            if (target.dataset.role === "backdrop") setHoverZone("bg");
            else setHoverZone(null);
          }}
          onMouseLeave={() => setHoverZone(null)}
          onClick={(e) => {
            const target = e.target as HTMLElement;
            if (target.dataset.role === "backdrop") onClose();
          }}
        >
          {/* Close Button (upper right) */}
          <IconButton
            sx={{
              position: "absolute",
              top: 16,
              right: 16,
              color: hoverZone === "bg" ? "primary.main" : "white",
              transition: "color 0.2s ease",
              zIndex: 20,
            }}
            onClick={onClose}
          >
            <CloseIcon fontSize="large" />
          </IconButton>

          {/* Main media wrapper */}
          <Box
            sx={{
              position: "relative",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "default",
            }}
          >
            {/* Hover / Click Zones inside image bounds */}
            <Box
              onMouseEnter={() => {
                setHoverZone("left");
                setIsLeftHovered(true);
              }}
              onMouseLeave={() => {
                setHoverZone(null);
                setIsLeftHovered(false);
              }}
              onClick={handlePrev}
              sx={{
                position: "absolute",
                left: 0,
                top: 0,
                bottom: 0,
                width: "50%",
                cursor: "w-resize",
                zIndex: 10,
                background: "transparent",
              }}
            />
            <Box
              onMouseEnter={() => {
                setHoverZone("right");
                setIsRightHovered(true);
              }}
              onMouseLeave={() => {
                setHoverZone(null);
                setIsRightHovered(false);
              }}
              onClick={handleNext}
              sx={{
                position: "absolute",
                right: 0,
                top: 0,
                bottom: 0,
                width: "50%",
                cursor: "e-resize",
                zIndex: 10,
                background: "transparent",
              }}
            />

            {/* Left arrow */}
            <IconButton
              onClick={handlePrev}
              onMouseEnter={() => setIsLeftHovered(true)}
              onMouseLeave={() => setIsLeftHovered(false)}
              sx={{
                position: "absolute",
                left: 8,
                top: "50%",
                transform: "translateY(-50%)",
                color:
                  isLeftHovered
                    ? "primary.main"
                    : "rgba(255,255,255,0.6)",
                transition: "color 0.2s ease",
                zIndex: 20,
                cursor: "pointer",
              }}
            >
              <ArrowBackIosNewIcon fontSize="large" />
            </IconButton>

            {/* Media itself */}
            {item.type === "video" ? (
              <Box
                component="video"
                src={item.src}
                controls
                autoPlay
                data-role="media"
                sx={{
                  maxHeight: "90vh",
                  maxWidth: "90vw",
                  borderRadius: 2,
                  boxShadow: 3,
                  objectFit: "contain",
                  zIndex: 5,
                }}
              />
            ) : (
              <Box
                component="img"
                src={item.src}
                alt={item.alt || ""}
                data-role="media"
                sx={{
                  maxHeight: "90vh",
                  maxWidth: "90vw",
                  borderRadius: 2,
                  boxShadow: 3,
                  objectFit: "contain",
                  zIndex: 5,
                  display: "block",
                }}
              />
            )}

            {/* Right arrow */}
            <IconButton
              onClick={handleNext}
              onMouseEnter={() => setIsRightHovered(true)}
              onMouseLeave={() => setIsRightHovered(false)}
              sx={{
                position: "absolute",
                right: 8,
                top: "50%",
                transform: "translateY(-50%)",
                color:
                  isRightHovered
                    ? "primary.main"
                    : "rgba(255,255,255,0.6)",
                transition: "color 0.2s ease",
                zIndex: 20,
                cursor: "pointer",
              }}
            >
              <ArrowForwardIosIcon fontSize="large" />
            </IconButton>
          </Box>
        </Box>
      </Fade>
    </Modal>
  );
}
