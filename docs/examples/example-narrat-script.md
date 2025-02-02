---
title: Example narrat script
description: An example narrat script
---

# Example narrat script

This is a copy of one of the example game scripts from the demo game in the narrat [examples folder](https://github.com/liana-p/narrat-engine/tree/main/packages/narrat/src/examples).

The narrat scripts used are in the [src/examples](https://github.com/liana-p/narrat-engine/tree/main/packages/narrat/src/examples) folder of the narrat package, while the config and assets are in the [base examples folder](https://github.com/liana-p/narrat-engine/tree/main/packages/narrat/examples)

For more up to date versions and more different examples, look at the various sample demo scripts directly on GitHub.

You can also refer to the [narrat-examples](https://github.com/liana-p/narrat-examples) repository which contains various example narrat projects.

```narrat
main:
  "You open the narrat demo and wonder what narrat is and how it works"
  choice:
    "How about asking for help?"
    "Ask for help":
      jump askForHelp
    "No, I don't want help 😡"
      jump dontAskForHelp

dontAskForHelp:
  // clear_dialog
  talk inner idle "Maybe we should get help though? I don't really know what else to do"
  jump main

askForHelp:
  set_screen narrat 0 slide-top 2000
  talk helper idle "Hello! I'm Bob the helper cat. I heard you're trying to play the narrat demo!"
  talk helper idle "<a href=\"https:\/\/narrat.dev\" target=\"_blank\">Narrat</a> is a game engine for narrative games that is based on web technologies. You can make games with it that will run on browsers (desktop and mobile) and can be built for PC too!"
  talk helper idle "You can view the source script for this demo in the <a href=\"https:\/\/github.com\/liana-p\/narrat/tree/main/packages/narrat/examples\" target=\"_blank\">narrat examples folder</a>"
  talk helper idle "If you want more info, you can look at the <a href=\"https:\/\/docs.narrat.dev/guides/getting-started\" target=\"_blank\">Getting Started guide</a>"
  talk helper idle "But for now, this is the demo! I will show you the most common features of narrat and how they work in practice."
  talk helper idle "As you've probably noticed, you can make choices in narrat games. Player choices are the basic building blocks of a narrative game, as it's what makes it interactive!"
  talk helper idle "There are lots of things you can do to make an interactive story in Narrat really. Choices are only one of the many features."
  talk helper idle "I'm going to send you to my other friend who has some questions for you."
  jump askAboutChoices

askAboutChoices:
  choice:
    talk cat idle "Hi! I'm Bob's friend, Felix! I have a question, do you like making choices in games?"
    "Yes":
      set data.likeChoices true
      "Cat will remember this."
    "No":
      set data.likeChoices false
      "Cat will remember this."
  choice:
    talk cat idle "Now I think we should do an activity based on choice making?"
    "Yes, I like making choices!" if $data.likeChoices: // A choice can have a condition so it only appears in the list if the condition is met
      jump makeChoices
    "No, I don't like making choices" if (! $data.likeChoices):
      jump dontLikeChoices
    "I don't want to do anything!":
      jump doNothing

dontLikeChoices:
  talk cat idle "See, this choice you picked only appeared as an option because you said you didn't like choices earlier!"
  talk cat idle "This demo has a lot of choices in it though, so you'll have to deal with it."
  jump doNothing


makeChoices:
  talk cat idle "See, this choice you picked only appeared as an option because you said you liked choices earlier!"
  choice:
    talk inner idle "I don't know, we've been making a lot of choices already lately."
    "I still want to make a choice!":
      talk helper idle "Well you just made one, it turns out. Can we continue now?"
      jump doNothing
    "I guess you're right":
      jump doNothing


doNothing:
  talk music_cat idle "How about we get some music in here?"
  wait 2000
  talk inner idle "Where did this one come from?"
  wait 1000
  talk player idle "Hello... music cat?"
  talk helper idle "(You may have noticed pauses between lines, this is the work of the 'wait' command)"
  talk music_cat idle "Yes, I'm music cat! I'm very cool and famous, you should have recognised me you know."
  wait 3000
  talk player idle "Yes... Sure. Music cat. Of course I definitely recognise you."
  talk helper idle "Also, music cat has custom CSS in his config."
  choice:
    talk music_cat idle "Anyway, can we get some music in there?"
    "Play some relaxing music":
      play music calm
    "Play battle music":
      play music battle
    "I hate music":
      talk music_cat idle "Well too bad, it's up to you."
  jump otherFeatures

otherFeatures:
  talk helper idle "There are lots of other features, like skill checks and conditions."
  add_level agility 1
  talk helper idle "For example you just levelled up in agility. You can view your skill level in the skills menu"
  add_xp agility 3
  talk helper idle "It's also possible to gain xp"
  talk helper idle "There are passive skill checks that happen by themselves without the player explicitly choosing to pass a test:"
  if (roll someSkillCheck agility 40): // You can use skillchecks in conditions
    "This line only appears if you passed a hidden passive skill check"
  add_xp agility 5
  "Skill checks can also happen as a choice option:"
  jump skillCheckChoice

skillCheckChoice:
  choice:
    "Should we try jumping over a fence?"
    roll aSkillCheck agility 70 "Try jumping!" hideAfterRoll:
      success:
        "You graciously jump over a fence, hair blowing in the wind, and land in a heroic pose that would be used in a movie trailer."
        talk inner idle "Woo I did it!!!"
      failure:
        "You try jumping over the fence, but not high enough. You stab your toe against the fence and fall head first into a puddle of mud. It's also in the background of a tiktok a passerby was filming now."
        talk inner idle "Ouch!"
    "No I'm a coward, I'd rather not":
      "Well okay then"
  add_xp agility 5
  jump stats

stats:
  talk helper idle "There is a stats features, which allows special values to be shown in the HUD. Useful to count currency, energy or things like that."
  jump stats_2

stats_2:
  choice:
    "Can we spend some energy?"
    "Spend 5 energy" if (>= $stats.energy.value 5):
      add_stat energy -5
      talk player idle "Spent 5 energy!"
    "I'm too tired!" if (<= $stats.energy.value 0):
      jump saveLoad
  jump stats_2

saveLoad:
  talk helper idle "Narrat can save and load the game too. It is done automatically, so no need to worry about it."
  talk helper idle "The game gets saved whenever the script reaches a new label. Labels are different parts of the game script to organise the game."
  talk helper idle "For example right now we're in the 'saveLoad' label of the script (you can look at it in the demo.narrat file!). So the game just saved recently"
  talk helper idle "If you try using the menu button to go back to the main menu and reload the game, it will resume at the start of this label."
  jump showMap

showMap:
  talk helper idle "There is also a screen feature on the left where you can display background images with interactive buttons."
  talk helper idle "Let's do a quest using the map feature."
  set_screen map
  talk helper idle "This is an example map. There can be buttons you can click on. It is possible to dynamically enable and disable buttons in your script"
  talk helper idle "let's look at a quest"
  jump quest_demo

demo_end:
  talk helper idle "That's it for now. If you want to learn more, read the docs, make games, look at how example games are made, or just play around."
  talk helper idle "Bye bye"
  set_screen default 0 slide-bottom 2000
```
