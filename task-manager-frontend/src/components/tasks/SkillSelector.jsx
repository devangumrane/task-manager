import React, { useState, useEffect } from 'react';
import { Autocomplete, TextField, Chip, CircularProgress } from '@mui/material';
import { api } from '../../api/axios';

export default function SkillSelector({ value = [], onChange, error }) {
    const [options, setOptions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [inputValue, setInputValue] = useState('');

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
    }, []);

    const handleChange = (event, newValue) => {
        // newValue is array of objects or strings (if freeSolo)
        // We want to pass array of IDs to parent, but parent might want full objects? 
        // The parent expects IDs for the API payload.
        // But for display we need objects. 
        // Let's assume parent controls state as array of objects or ids.
        // Ideally let's pass the whole objects back and let parent map to IDs.
        onChange(newValue);
    };

    const handleCreate = async (name) => {
        // Optimistic update or API call
        try {
            const res = await api.post('/analytics/skills', { name, category: 'TECHNICAL' });
            const newSkill = res.data.data;
            setOptions(prev => [...prev, newSkill]);
            onChange([...value, newSkill]);
        } catch (err) {
            console.error("Failed to create skill", err);
        }
    };

    return (
        <Autocomplete
            multiple
            freeSolo
            options={options}
            getOptionLabel={(option) => {
                if (typeof option === 'string') return option;
                return option.name;
            }}
            value={value}
            onChange={(event, newValue) => {
                // specific handling for "Create 'X'" if needed, but freeSolo handles strings
                const last = newValue[newValue.length - 1];
                if (typeof last === 'string') {
                    // User typed custom value
                    handleCreate(last);
                    // Remove string from value until it's created? 
                    // Actually handleCreate updates value using onChange. 
                    // but here we are in onChange.
                    // Let's reject the string update here and let handleCreate do it.
                    // onChange(newValue.filter(v => typeof v !== 'string')); 
                    return;
                }
                onChange(newValue);
            }}
            loading={loading}
            isOptionEqualToValue={(option, val) => option.id === val.id}
            renderInput={(params) => (
                <TextField
                    {...params}
                    label="Required Skills"
                    placeholder="e.g. React, Node.js"
                    error={Boolean(error)}
                    helperText={error}
                    InputProps={{
                        ...params.InputProps,
                        endAdornment: (
                            <React.Fragment>
                                {loading ? <CircularProgress color="inherit" size={20} /> : null}
                                {params.InputProps.endAdornment}
                            </React.Fragment>
                        ),
                    }}
                />
            )}
        />
    );
}
