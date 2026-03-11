// Core conflict detection algorithms

export const detectConflicts = (requests) => {
  const conflicts = [];
  const grouped = groupByResourceAndDate(requests);

  for (const group of Object.values(grouped)) {
    const sorted = sortRequestsByTime(group);

    for (let i = 0; i < sorted.length; i++) {
      for (let j = i + 1; j < sorted.length; j++) {
        if (hasOverlap(sorted[i], sorted[j])) {
          conflicts.push({
            request1: sorted[i],
            request2: sorted[j],
            resourceId: sorted[i].resourceId,
          });
        }
      }
    }
  }

  return conflicts;
};

// 🔥 NEW GROUPING (resource + date)
export const groupByResourceAndDate = (requests) => {
  return requests.reduce((acc, request) => {
    const key = `${request.resourceId}_${request.date}`;
    if (!acc[key]) acc[key] = [];
    acc[key].push(request);
    return acc;
  }, {});
};

export const sortRequestsByTime = (requests) => {
  return [...requests].sort((a, b) =>
    timeToMinutes(a.startTime) - timeToMinutes(b.startTime)
  );
};

export const hasOverlap = (request1, request2) => {
  const start1 = timeToMinutes(request1.startTime);
  const end1 = timeToMinutes(request1.endTime);
  const start2 = timeToMinutes(request2.startTime);
  const end2 = timeToMinutes(request2.endTime);

  return start1 < end2 && start2 < end1;
};

export const timeToMinutes = (time) => {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
};

export const minutesToTime = (minutes) => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, "0")}:${mins
    .toString()
    .padStart(2, "0")}`;
};

const priorityValue = {
  High: 3,
  Medium: 2,
  Low: 1,
};

export const optimizeAllocations = (requests) => {
  const grouped = groupByResourceAndDate(requests);

  const allocations = [];
  const rejected = [];
  const rescheduled = [];

  for (const group of Object.values(grouped)) {
    const sorted = [...group].sort((a, b) => {
      if (priorityValue[b.priority] !== priorityValue[a.priority]) {
        return priorityValue[b.priority] - priorityValue[a.priority];
      }
      return timeToMinutes(a.endTime) - timeToMinutes(b.endTime);
    });

    const selected = [];

    for (const request of sorted) {
      let conflict = selected.find(existing =>
        hasOverlap(request, existing)
      );

      if (!conflict) {
        selected.push({ ...request, status: "Approved" });
      } else {
        const alternateTime = findAlternateTime(request, selected);

        if (alternateTime) {
          rescheduled.push({
            ...request,
            status: "Rescheduled",
            suggestedTime: alternateTime,
          });
        } else {
          rejected.push({ ...request, status: "Rejected" });
        }
      }
    }

    allocations.push(...selected);
  }

  return { allocations, rejected, rescheduled };
};

export const findAlternateTime = (request, existingAllocations) => {
  const startMinutes = timeToMinutes(request.startTime);
  const duration =
    timeToMinutes(request.endTime) - startMinutes;

  for (let offset = 30; offset <= 240; offset += 30) {
    const newStart = startMinutes + offset;
    const newEnd = newStart + duration;

    if (newEnd <= 24 * 60) {
      const newRequest = {
        ...request,
        startTime: minutesToTime(newStart),
        endTime: minutesToTime(newEnd),
      };

      const overlaps = existingAllocations.some(existing =>
        hasOverlap(newRequest, existing)
      );

      if (!overlaps) {
        return {
          startTime: newRequest.startTime,
          endTime: newRequest.endTime,
        };
      }
    }
  }

  return null;
};
