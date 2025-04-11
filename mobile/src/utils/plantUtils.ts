/**
 * Returns the number of days until next watering
 */
export function getDaysUntilWatering(lastWatered: string | Date | null, frequency: number): number | null {
  if (!lastWatered) return null;
  
  const lastWateredDate = new Date(lastWatered);
  const today = new Date();
  const diffTime = today.getTime() - lastWateredDate.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  return Math.max(0, frequency - diffDays);
}

/**
 * Returns a user-friendly string describing watering status
 */
export function getWaterStatusText(lastWatered: string | Date | null, frequency: number): string {
  if (!lastWatered) return 'Not watered yet';
  
  const daysUntil = getDaysUntilWatering(lastWatered, frequency);
  
  if (daysUntil === null) return 'Not watered yet';
  if (daysUntil === 0) return 'Needs water today';
  if (daysUntil < 0) return `Overdue by ${Math.abs(daysUntil)} days`;
  if (daysUntil === 1) return 'Water tomorrow';
  return `Water in ${daysUntil} days`;
}

/**
 * Returns a progress value (0-1) representing how urgent watering is
 */
export function getWaterProgress(lastWatered: string | Date | null, frequency: number): number {
  if (!lastWatered) return 1; // Not watered yet = max urgency
  
  const lastWateredDate = new Date(lastWatered);
  const today = new Date();
  const diffTime = today.getTime() - lastWateredDate.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  return Math.min(1, Math.max(0, diffDays / frequency));
}

/**
 * Format date to a readable string
 */
export function formatDate(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  });
}

/**
 * Format time to a readable string
 */
export function formatTime(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit' 
  });
}
