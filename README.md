# FinanceDashboard
Police incident report visualization for San Francisco Police Department dataset.

`This project was created as a homework assignment.`  

This project lacks additional README files, as default npm start/build/other commands should be sufficient for local development and hosting.

[A sample release is available here](https://liveearth-dawson-homework.netlify.app/).

## Known Issues
- Query fails when slider above ~450k incidents
    - This is due to the limitations set by Socrata, who provides the api for the dataset. The slider could be adjusted, but the issue is mostly harmless and can display an alert to the user simulating failed api calls.
    - The dataset also technically contains roughly a million incidents at the time of writing so the limit was set to a clean 1,000,000.
- App sluggish with a large number of incidents on screen (This likely varies by system, but has also been noted to vary by browser Opera vs Chrome - did not do much browser testing to narrow down reasoning but assumed to be intentional resource limitation by Opera).
    - The MapSF component remounts when moving the map, which contributes a lot to the degradation in responsiveness. Making optimizations to account for this or correct it should help performance, if not fix it altogether.

## Author
- [James Dawson Horn](https://github.com/jhorn00)
