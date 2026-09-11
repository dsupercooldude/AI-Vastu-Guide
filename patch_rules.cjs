const fs = require('fs');
let rules = fs.readFileSync('firestore.rules', 'utf8');

const targetHouseEnd = `      allow delete: if isOwner(userId) && existing().userId == request.auth.uid;
    }`;

const rulesToAdd = `
    function isValidImage(data) {
      return data.keys().hasAll(['id', 'base64', 'mimeType', 'createdAt'])
        && data.id is string && data.id.size() <= 128
        && data.base64 is string && data.base64.size() <= 1000000
        && data.mimeType is string && data.mimeType.size() <= 100
        && data.createdAt is number;
    }

    match /users/{userId}/houses/{houseId}/photos/{imageId} {
      allow read: if isOwner(userId);
      allow create: if isOwner(userId) && isValidImage(incoming());
      allow update: if isOwner(userId) && isValidImage(incoming()) && incoming().id == existing().id && incoming().createdAt == existing().createdAt;
      allow delete: if isOwner(userId);
    }
    
    match /users/{userId}/houses/{houseId}/floorPlans/{imageId} {
      allow read: if isOwner(userId);
      allow create: if isOwner(userId) && isValidImage(incoming());
      allow update: if isOwner(userId) && isValidImage(incoming()) && incoming().id == existing().id && incoming().createdAt == existing().createdAt;
      allow delete: if isOwner(userId);
    }`;

rules = rules.replace(targetHouseEnd, targetHouseEnd + rulesToAdd);
fs.writeFileSync('firestore.rules', rules);
