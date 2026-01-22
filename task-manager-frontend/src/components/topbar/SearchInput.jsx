import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Search } from "lucide-react";
import { Input } from "../ui/input";

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
        className="absolute left-3 text-muted-foreground pointer-events-none"
      />

      <Input
        ref={inputRef}
        placeholder="Search..."
        onFocus={() => setExpanded(true)}
        onBlur={() => setExpanded(false)}
        className="pl-9 pr-3 py-2 h-9 rounded-md border bg-background
                   focus-visible:ring-2 focus-visible:ring-ring focus:outline-none text-sm"
      />
    </motion.div>
  );
}
