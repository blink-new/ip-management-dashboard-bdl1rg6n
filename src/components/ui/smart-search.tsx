import React, { useState, useEffect, useMemo } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Check, ChevronsUpDown, Plus, X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SmartSearchProps {
  value: string[]
  onChange: (value: string[]) => void
  suggestions: string[]
  placeholder?: string
  label?: string
  maxItems?: number
  allowCustom?: boolean
  className?: string
}

// Fuzzy search function
function fuzzySearch(query: string, items: string[]): string[] {
  if (!query) return items

  const queryLower = query.toLowerCase()
  
  return items
    .map(item => {
      const itemLower = item.toLowerCase()
      let score = 0
      
      // Exact match gets highest score
      if (itemLower === queryLower) {
        score = 1000
      }
      // Starts with query gets high score
      else if (itemLower.startsWith(queryLower)) {
        score = 500
      }
      // Contains query gets medium score
      else if (itemLower.includes(queryLower)) {
        score = 100
      }
      // Fuzzy match - check if all characters in query exist in order
      else {
        let queryIndex = 0
        for (let i = 0; i < itemLower.length && queryIndex < queryLower.length; i++) {
          if (itemLower[i] === queryLower[queryIndex]) {
            queryIndex++
            score += 10
          }
        }
        // Only include if we matched all query characters
        if (queryIndex < queryLower.length) {
          score = 0
        }
      }
      
      return { item, score }
    })
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .map(({ item }) => item)
}

export function SmartSearch({
  value,
  onChange,
  suggestions,
  placeholder = "Search or add new...",
  label,
  maxItems,
  allowCustom = true,
  className
}: SmartSearchProps) {
  const [open, setOpen] = useState(false)
  const [inputValue, setInputValue] = useState('')

  // Filter suggestions based on fuzzy search and exclude already selected items
  const filteredSuggestions = useMemo(() => {
    const available = suggestions.filter(item => !value.includes(item))
    return fuzzySearch(inputValue, available).slice(0, 10) // Limit to 10 suggestions
  }, [inputValue, suggestions, value])

  const handleSelect = (selectedValue: string) => {
    if (!value.includes(selectedValue) && (!maxItems || value.length < maxItems)) {
      onChange([...value, selectedValue])
    }
    setInputValue('')
    setOpen(false)
  }

  const handleAddCustom = () => {
    const trimmedValue = inputValue.trim()
    if (trimmedValue && !value.includes(trimmedValue) && (!maxItems || value.length < maxItems)) {
      onChange([...value, trimmedValue])
      setInputValue('')
      setOpen(false)
    }
  }

  const handleRemove = (itemToRemove: string) => {
    onChange(value.filter(item => item !== itemToRemove))
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && inputValue.trim() && allowCustom) {
      e.preventDefault()
      handleAddCustom()
    }
  }

  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <label className="text-sm font-medium text-gray-700">{label}</label>
      )}
      
      {/* Selected items */}
      {value.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {value.map((item, index) => (
            <Badge key={index} variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
              {item}
              <button
                type="button"
                onClick={() => handleRemove(item)}
                className="ml-2 hover:text-red-600"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}

      {/* Search input */}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
            disabled={maxItems ? value.length >= maxItems : false}
          >
            <span className="text-gray-500">
              {maxItems && value.length >= maxItems 
                ? `Maximum ${maxItems} items selected`
                : placeholder
              }
            </span>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" align="start">
          <Command>
            <CommandInput
              placeholder={placeholder}
              value={inputValue}
              onValueChange={setInputValue}
              onKeyDown={handleKeyDown}
            />
            <CommandList>
              {filteredSuggestions.length === 0 && inputValue && (
                <CommandEmpty>
                  {allowCustom ? (
                    <div className="p-2">
                      <Button
                        variant="ghost"
                        className="w-full justify-start"
                        onClick={handleAddCustom}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add "{inputValue}"
                      </Button>
                    </div>
                  ) : (
                    "No results found."
                  )}
                </CommandEmpty>
              )}
              
              {filteredSuggestions.length > 0 && (
                <CommandGroup>
                  {filteredSuggestions.map((suggestion) => (
                    <CommandItem
                      key={suggestion}
                      value={suggestion}
                      onSelect={() => handleSelect(suggestion)}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          value.includes(suggestion) ? "opacity-100" : "opacity-0"
                        )}
                      />
                      {suggestion}
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
              
              {allowCustom && inputValue && !filteredSuggestions.includes(inputValue) && (
                <CommandGroup>
                  <CommandItem onSelect={handleAddCustom}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add "{inputValue}"
                  </CommandItem>
                </CommandGroup>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  )
}