// Core conflict detection algorithms

export const detectConflicts = (requests) => {
  const conflicts = [];
  const groupedByResource = groupRequestsByResource(requests);
  
  for (const [resourceId, resourceRequests] of Object.entries(groupedByResource)) {
    // Sort by start time
    const sorted = sortRequestsByTime(resourceRequests);
    
    // Detect overlaps
    for (let i = 0; i < sorted.length; i++) {
      for (let j = i + 1; j < sorted.length; j++) {
        if (hasOverlap(sorted[i], sorted[j])) {
          conflicts.push({
            request1: sorted[i],
            request2: sorted[j],
            resourceId: resourceId
          });
        }
      }
    }
  }
  
  return conflicts;
};

export const groupRequestsByResource = (requests) => {
  return requests.reduce((acc, request) => {
    const key = request.resourceId;
    if (!acc[key]) acc[key] = [];
    acc[key].push(request);
    return acc;
  }, {});
};

export const sortRequestsByTime = (requests) => {
  return [...requests].sort((a, b) => {
    if (a.date !== b.date) return a.date.localeCompare(b.date);
    return a.startTime.localeCompare(b.startTime);
  });
};

export const hasOverlap = (request1, request2) => {
  // Same date check
  if (request1.date !== request2.date) return false;
  
  // Convert times to minutes for comparison
  const start1 = timeToMinutes(request1.startTime);
  const end1 = timeToMinutes(request1.endTime);
  const start2 = timeToMinutes(request2.startTime);
  const end2 = timeToMinutes(request2.endTime);
  
  // Check overlap
  return (start1 < end2 && start2 < end1);
};

export const timeToMinutes = (time) => {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
};

// Priority values for comparison
const priorityValue = {
  'High': 3,
  'Medium': 2,
  'Low': 1
};

// Greedy interval scheduling with priority
export const optimizeAllocations = (requests) => {
  const groupedByResource = groupRequestsByResource(requests);
  const allocations = [];
  const rejected = [];
  const rescheduled = [];
  
  for (const [resourceId, resourceRequests] of Object.entries(groupedByResource)) {
    // Sort by priority (High first) then by end time (for greedy algorithm)
    const sorted = [...resourceRequests].sort((a, b) => {
      if (priorityValue[b.priority] !== priorityValue[a.priority]) {
        return priorityValue[b.priority] - priorityValue[a.priority];
      }
      return timeToMinutes(a.endTime) - timeToMinutes(b.endTime);
    });
    
    // Greedy selection
    const selected = [];
    const rejectedForResource = [];
    
    for (const request of sorted) {
      let canAllocate = true;
      
      // Check against already selected requests
      for (const selectedRequest of selected) {
        if (hasOverlap(request, selectedRequest)) {
          canAllocate = false;
          break;
        }
      }
      
      if (canAllocate) {
        selected.push({...request, status: 'Approved'});
      } else {
        // Try to find alternate time (simplified - just suggest next hour)
        const alternateTime = findAlternateTime(request, selected);
        if (alternateTime) {
          rescheduled.push({
            ...request,
            status: 'Rescheduled',
            suggestedTime: alternateTime
          });
        } else {
          rejectedForResource.push({...request, status: 'Rejected'});
        }
      }
    }
    
    allocations.push(...selected);
    rejected.push(...rejectedForResource);
  }
  
  return { allocations, rejected, rescheduled };
};

export const findAlternateTime = (request, existingAllocations) => {
  // Simplified alternate time suggestion
  // In production, this would be more sophisticated
  const startMinutes = timeToMinutes(request.startTime);
  const duration = timeToMinutes(request.endTime) - startMinutes;
  
  // Try slots with 30-minute increments
  for (let offset = 30; offset <= 120; offset += 30) {
    const newStart = startMinutes + offset;
    const newEnd = newStart + duration;
    
    if (newEnd <= 24 * 60) { // Within day
      const newRequest = {
        ...request,
        startTime: minutesToTime(newStart),
        endTime: minutesToTime(newEnd)
      };
      
      // Check if this slot works
      let slotAvailable = true;
      for (const existing of existingAllocations) {
        if (hasOverlap(newRequest, existing)) {
          slotAvailable = false;
          break;
        }
      }
      
      if (slotAvailable) {
        return {
          startTime: newRequest.startTime,
          endTime: newRequest.endTime
        };
      }
    }
  }
  
  return null;
};

export const minutesToTime = (minutes) => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
};