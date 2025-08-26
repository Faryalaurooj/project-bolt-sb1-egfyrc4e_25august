```diff
--- a/src/components/contacts/NewContactModal.jsx
+++ b/src/components/contacts/NewContactModal.jsx
@@ -109,7 +109,7 @@
     setError('');
 
     try {
-      await createContact({
+      const newContact = await createContact({
         first_name: formData.firstName,
         last_name: formData.lastName,
         date_of_birth: formData.dateOfBirth || null,
@@ -145,14 +145,14 @@
       // Create household members if any
       if (householdMembers.length > 0) {
         for (const member of householdMembers) {
-          if (member.first_name && member.last_name) {
+          if (member.first_name && member.last_name && newContact?.id) {
             await createHouseholdMember({
               ...member,
-              contact_id: data.user.id // This would need the actual contact ID from the response
+              contact_id: newContact.id
             });
           }
         }
       }
 
       // Upload policy documents if any
       if (policyDocuments.length > 0) {
-        for (const doc of policyDocuments) {
-          await createPolicyDocument(data.user.id, doc.file);
+        for (const doc of policyDocuments) { // Assuming doc.file is the actual file object
+          await createPolicyDocument(newContact.id, doc.file);
         }
       }
 
```