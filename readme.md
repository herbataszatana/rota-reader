# Initial plan for rota reader 
1. Initial UI List of the employers:  
   - frontend to allow upload of the xlsx file
     - ask user to upload rota 
   - send it to backend to read the employees names and pass the list to front end
   - front end to allow to pick from list by typing their name and select it to pass to backend again
   - (optional) user to select the date range for the period they want the event to be created for 
   - (optional) select the route/link? -should be based on their name 
2. Once users name was selected (and date), frontend to pass parameters (name and date range) to the backend for the actual logic of reading rota, 
   - the logic should decide in which route does the employee belong to 
   - the logic then should calculate how many weeks ahead to check the shifts for remembering the pattern of next week is the next person on the list
3. On UI Show the outcome of calculations in form of the shifts - say the shift number, times and dates, display it as a list (NICE TO HAVE as a calendar)
4. UI should give the user choice of creating the calendar events - (NICE TO HAVE - allow users to select the shift they want to pick)
5. If user selects to create the calendar events forward the list containing shifts details to backend, (NICE TO HAVE upon deciding to go yes show spinning circle) 
6. Backend to process the shifts[] and generate ics events and forward it to the frontend 
7. Frontend to notify user of the success or failure message.


![Proposed workflow diagram.jpg](diagrams/Proposed%20workflow%20diagram.jpg)


TO DO :
- [ ] add download option (backend and frontend)
- [ ] datepicker warning
  - [ ] if the end date is before start date and if start date is after end date
  - [ ] if no end date then generate 27 weeks from the start date
  - [ ] if no start date then generate from wc date 
  - [ ] if selected period before wc date - warn there is no rota before 
  - [ ] if selected period is a year after wc date then warning that only done 52 weeks (max)
- [ ] loading bard when fetching data etc
- [ ] move automatically when new component appears
- [x ] filter out 'vacancy' from employees list
- [ ] add redo at the end 
- [ ] add success alert when generated download
- [ ] create script to download all dependencies on initial run and then start both server and angular and open browser 