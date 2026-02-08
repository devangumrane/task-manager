import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Search } from "lucide-react";
import { InputBase, Paper } from "@mui/material";

export default function SearchInput() {
  const [expanded, setExpanded] = useState(false);
  const inputRef = useRef(null);

  return (
    <motion.div
      initial={false}
      animate={{
        width: expanded ? "260px" : "180px",
      }}
      transition={{ duration: 0.25, ease: "easeInOut" }}
      className="relative flex items-center"
    >
      <Search
        size={16}
        className="absolute left-3 text-muted-foreground pointer-events-none z-10"
      />

      <InputBase
        inputRef={inputRef}
        placeholder="Search..."
        onFocus={() => setExpanded(true)}
        onBlur={() => setExpanded(false)}
        sx={{
          pl: 5,
          pr: 2,
          py: 0.5,
          height: 36,
          width: '100%',
          borderRadius: 1,
          border: '1px solid',
          borderColor: 'divider',
          bgcolor: 'background.paper',
          fontSize: '0.875rem',
          transition: 'all 0.2s',
          '&.Mui-focused': {
            borderColor: 'primary.main',
            boxShadow: (theme) => `0 0 0 2px ${theme.palette.primary.main}20`
          }
        }}
      />
    </motion.div>
  );
}
