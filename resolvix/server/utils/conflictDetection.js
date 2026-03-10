// Reuse the same algorithms from frontend
const timeToMinutes = (time) => {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
};

const minutesToTime = (minutes) => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
};

const hasOverlap = (request1, request2) => {
  if (request1.date !== request2.date) return false;
  
  const start1 = timeToMinutes(request1.startTime);
  const end1 = timeToMinutes(request1.endTime);
  const start2 = timeToMinutes(request2.startTime);
  const end2 = timeToMinutes(request2.endTime);
  
  return (start1 < end2 && start2 < end1);
};

const groupByResource = (requests) => {
  return requests.reduce((acc, request) => {
    const key = request.resourceId._id.toString();
    if (!acc[key]) acc[key] = [];
    acc[key].push(request);
    return acc;
  }, {});
};

const priorityValue = {
  'High': 3,
  'Medium': 2,
  'Low': 1
};

exports.detectConflicts = (requests) => {
  const conflicts = [];
  const grouped = groupByResource(requests);
  
  for (const resourceRequests of Object.values(grouped)) {
    for (let i = 0; i < resourceRequests.length; i++) {
      for (let j = i + 1; j < resourceRequests.length; j++) {
        if (hasOverlap(resourceRequests[i], resourceRequests[j])) {
          conflicts.push({
            request1: resourceRequests[i],
            request2: resourceRequests[j]
          });
        }
      }
    }
  }
  
  return conflicts;
};

exports.optimizeAllocations = (requests) => {
  const grouped = groupByResource(requests);
  const allocations = [];
  const rejected = [];
  const rescheduled = [];
  
  for (const resourceRequests of Object.values(grouped)) {
    const sorted = [...resourceRequests].sort((a, b) => {
      if (priorityValue[b.priority] !== priorityValue[a.priority]) {
        return priorityValue[b.priority] - priorityValue[a.priority];
      }
      return timeToMinutes(a.endTime) - timeToMinutes(b.endTime);
    });
    
    const selected = [];
    const rejectedForResource = [];
    
    for (const request of sorted) {
      let canAllocate = true;
      
      for (const selectedRequest of selected) {
        if (hasOverlap(request, selectedRequest)) {
          canAllocate = false;
          break;
        }
      }
      
      if (canAllocate) {
        selected.push(request);
        allocations.push(request);
      } else {
        // Try to find alternate slot
        const alternateTime = findAlternateTime(request, selected);
        if (alternateTime) {
          rescheduled.push({
            ...request.toObject(),
            suggestedTime: alternateTime
          });
        } else {
          rejectedForResource.push(request);
          rejected.push(request);
        }
      }
    }
  }
  
  return { allocations, rejected, rescheduled };
};

const findAlternateTime = (request, existingAllocations) => {
  const startMinutes = timeToMinutes(request.startTime);
  const duration = timeToMinutes(request.endTime) - startMinutes;
  
  for (let offset = 30; offset <= 120; offset += 30) {
    const newStart = startMinutes + offset;
    const newEnd = newStart + duration;
    
    if (newEnd <= 24 * 60) {
      const newRequest = {
        ...request.toObject(),
        startTime: minutesToTime(newStart),
        endTime: minutesToTime(newEnd)
      };
      
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