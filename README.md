## OVERVIEW

_The reference for this project was drawn up by Chloe (May-Moonish)._
![reference image](https://cdn.discordapp.com/attachments/1560452979281231953/1560523369164701777/Steam_library_mockup.png?ex=6ae186a4&is=6ae03524&hm=77cd05218fb42371d65ad6e6779cc14bfb0b6d2e24f944c950b49c76538f849f&)

_The itch.io image used in the project was sourced from [Here](https://static.itch.io/images/app-icon.png) on itch.io._

![itch.io image](https://static.itch.io/images/app-icon.png)


# BACKGROUND
The creation of the project was assisted with AI. Specifically, some parts of the visualization functionality like the entry library and scrollbar. AI generated blocks of code was used as a reference to alter and create  other pieces of functional visuals. For example, the search bar, additional game details like date submitted, coolness, and overall rating was done by hand (game name and description display was coded by AI). Furthermore, the JSON API handling was done by hand as well. The separation of code blocks, into respective draw calls, gets and sets, the init() block, data valid checks, and the invalid data error fallback page was done by hand.

Due to "CORS" Query protection, this project is not as dynamic as we were hoping. Ideally, this project's functionality extended to users the ability to input any itch.io jam ID and browse entries. The source code reveals a portion of this attempt, with commented out proxy workarounds, and empty display blocks for jam override buttons that never made it to the final version. As it stands, this project loads a local JSON version of the Bezi Mega Game jam JSON one can find by inputting the jam ID link into the browser, and displays that data. 
