import React, { useState, useEffect, useRef } from 'react';
import api from '../../api/axios';
import { X, Search, Plus, Loader2 } from 'lucide-react';

export default function SkillSelector({ value = [], onChange, error }) {
    const [options, setOptions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [inputValue, setInputValue] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const wrapperRef = useRef(null);

    useEffect(() => {
        const fetchSkills = async () => {
            setLoading(true);
            try {
                const res = await api.get('/analytics/skills');
                setOptions(res.data.data);
            } catch (err) {
                console.error("Failed to fetch skills", err);
            } finally {
                setLoading(false);
            }
        };
        fetchSkills();

        // Click outside listener
        function handleClickOutside(event) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSelect = (skill) => {
        if (!value.find(v => v.id === skill.id)) {
            onChange([...value, skill]);
        }
        setInputValue('');
        setIsOpen(false);
    };

    const handleRemove = (skillId) => {
        onChange(value.filter(v => v.id !== skillId));
    };

    const handleCreate = async () => {
        if (!inputValue.trim()) return;
        try {
            const res = await api.post('/analytics/skills', { name: inputValue, category: 'TECHNICAL' });
            const newSkill = res.data.data;
            setOptions(prev => [...prev, newSkill]);
            handleSelect(newSkill);
        } catch (err) {
            console.error("Failed to create skill", err);
        }
    };

    const filteredOptions = options.filter(opt =>
        opt.name.toLowerCase().includes(inputValue.toLowerCase()) &&
        !value.find(v => v.id === opt.id)
    );

    return (
        <div className="relative space-y-2" ref={wrapperRef}>
            {/* Selected Chips */}
            <div className="flex flex-wrap gap-2 mb-2">
                {value.map(skill => (
                    <div key={skill.id} className="flex items-center gap-1 bg-primary/20 text-primary text-xs font-medium px-2 py-1 rounded-md border border-primary/20">
                        {skill.name}
                        <button onClick={() => handleRemove(skill.id)} className="hover:bg-primary/30 rounded-full p-0.5">
                            <X size={12} />
                        </button>
                    </div>
                ))}
            </div>

            {/* Input */}
            <div className={`flex items-center gap-2 border rounded-lg px-3 py-2 bg-black/20 focus-within:ring-2 focus-within:ring-primary/50 transition-all ${error ? 'border-red-500' : 'border-white/10'}`}>
                <Search size={16} className="text-muted-foreground" />
                <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => {
                        setInputValue(e.target.value);
                        setIsOpen(true);
                    }}
                    onFocus={() => setIsOpen(true)}
                    placeholder="Search or create skills..."
                    className="bg-transparent border-none outline-none text-sm w-full placeholder:text-muted-foreground/50 text-white"
                />
                {loading && <Loader2 size={16} className="animate-spin text-muted-foreground" />}
            </div>
            {error && <p className="text-xs text-red-400">{error}</p>}

            {/* Dropdown */}
            {isOpen && (inputValue || filteredOptions.length > 0) && (
                <div className="absolute z-50 w-full mt-1 bg-[#151A23] border border-white/10 rounded-lg shadow-xl max-h-60 overflow-y-auto custom-scrollbar p-1">
                    {filteredOptions.length > 0 ? (
                        filteredOptions.map(option => (
                            <button
                                key={option.id}
                                onClick={() => handleSelect(option)}
                                className="w-full text-left px-3 py-2 text-sm text-gray-300 hover:bg-white/5 hover:text-white rounded-md transition-colors"
                            >
                                {option.name}
                            </button>
                        ))
                    ) : (
                        <div className="p-2 text-center text-xs text-muted-foreground">
                            No matching skills.
                        </div>
                    )}

                    {inputValue && !filteredOptions.find(o => o.name.toLowerCase() === inputValue.toLowerCase()) && (
                        <button
                            onClick={handleCreate}
                            className="w-full text-left px-3 py-2 text-sm text-primary hover:bg-primary/10 rounded-md transition-colors flex items-center gap-2 border-t border-white/5 mt-1"
                        >
                            <Plus size={14} /> Create "{inputValue}"
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}
