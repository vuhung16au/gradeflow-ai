# In "Upload Submissions" tab, Users can view the detail of the current assessment info by clicking into the box of assessment 

In "Upload Submissions" tab 

- Show the current selected assessment info above "Upload Submissions" label 
- Users can view the detail (including the title, description, marking criteria, and instructions for students) of the current assessment info by clicking into the box of assessment 

- make the detail info box wider (80% of the screen width) 
- users can scroll up and down if the len of the info box is too long 

show the detail info box in markdown format 



# Implement the "Edit" button for the "Grading Results" tab

- when clicked on the "Edit" button, users can edit the grading result of ONE "student submission"
- the grading result is in markdown format
- the grading result is the same as the grading result in the "Grading Results" tab
- the "Edit" button is in the "Grading Results" tab


# Users can copy the grading result of ONE "student submission" to clipboard (one-click copy)

- the grading result is in markdown format
- the grading result is the same as the grading result in the "Grading Results" tab


# Manage the status of submissions

List of Status:
- Graded 
- Not Graded 

In "Upload Submissions" tab: 
- users can view the list of submissions
- users can view the status of each submission
- When clicked on the "Start Grading" button, don't grade it again (if it is already graded, show the grading results)


# Handle folder upload as ONE "student submission"

- if the "student submission" is a folder, then treat it as ONE "student submission" containing all the files in the folder

# Handle zip file as ONE "student submission"

- if the "student submission" is a zip file, then treat it as ONE "student submission"

# Treat ONE batch of "student submission" as ONE "student submission"

- if the "student submission" is a single file, then treat it as ONE "student submission" 
- if the "student submission" contains multiple files, then treat it as ONE "student submission" (currently, we treat this cases as multiple submissions from different students)

# Users can view the detailed of uploaded "Your Assessments" 

- by clicking on the one of the "Your Assessments"
- view Assessment Title
- view Assessment Description
- view Assessment Marking Criteria
- view Assessment Instructions for Students

# Implement Dark/light for the UI 

Default is dark mode. 

# users are able to delete one or more "Individual Results" 

- view the list of Individual Results
- delete one by one 
- delete all 


# users are able to delete one or more "submissions uploaded" 

- view the list of submissions uploaded
- delete one by one 
- delete all 

# Make sure the the grading results are based on 

- uploaded 'Marking Criteria', and
- uploaded 'Instructions for Students'
- uploaded 'student submission'

Pls review the Gemini prompt and give me some feedback for improvements. 