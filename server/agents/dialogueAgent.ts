import { HfInference } from '@huggingface/inference';
import { DialogueLine } from '@shared/schema';

// Initialize Hugging Face client
const hf = new HfInference(process.env.HUGGINGFACE_API_KEY || "");

// Helper function to generate dynamic dialogue based on script content
function generateDynamicDialogue(script: string, characters: any): DialogueLine[] {
  // Extract key elements from the script
  const scriptLower = script.toLowerCase();
  const scenes = script.split(/Scene \d+:/i).filter(s => s.trim().length > 0);
  const mainCharName = "MAIN CHARACTER";
  
  // Identify supporting character types from script
  const supportingCharacters = [];
  if (scriptLower.includes("friend") || scriptLower.includes("buddy")) supportingCharacters.push("FRIEND");
  if (scriptLower.includes("family") || scriptLower.includes("parent") || scriptLower.includes("mom") || scriptLower.includes("dad")) supportingCharacters.push("FAMILY MEMBER");
  if (scriptLower.includes("coworker") || scriptLower.includes("colleague") || scriptLower.includes("boss") || scriptLower.includes("work")) supportingCharacters.push("COLLEAGUE");
  if (scriptLower.includes("stranger") || scriptLower.includes("person")) supportingCharacters.push("STRANGER");
  if (scriptLower.includes("teacher") || scriptLower.includes("student") || scriptLower.includes("classmate")) supportingCharacters.push("CLASSMATE");
  if (scriptLower.includes("store") || scriptLower.includes("shop") || scriptLower.includes("restaurant")) supportingCharacters.push("STORE CLERK");
  
  // Add generic supporting characters if none found
  if (supportingCharacters.length === 0) {
    supportingCharacters.push("FRIEND", "COLLEAGUE");
  }
  
  // Determine mood/tone from the script
  const tones = {
    happy: scriptLower.includes("happy") || scriptLower.includes("joy") || scriptLower.includes("celebration") || scriptLower.includes("success"),
    sad: scriptLower.includes("sad") || scriptLower.includes("disappoint") || scriptLower.includes("upset"),
    excited: scriptLower.includes("excite") || scriptLower.includes("adventure") || scriptLower.includes("thrill"),
    nervous: scriptLower.includes("nervous") || scriptLower.includes("anxious") || scriptLower.includes("worry"),
    relaxed: scriptLower.includes("relax") || scriptLower.includes("calm") || scriptLower.includes("peace"),
    frustrated: scriptLower.includes("frustrat") || scriptLower.includes("challenge") || scriptLower.includes("problem")
  };
  
  // Choose primary and secondary tones
  const primaryTone = Object.entries(tones).filter(([_, value]) => value)[0]?.[0] || "neutral";
  
  // Create dialogue that reflects scenes in the script
  const dialogue: DialogueLine[] = [];
  
  // Add narrator opening if appropriate
  if (Math.random() > 0.7) {
    dialogue.push({
      character: "NARRATOR",
      text: getIntroNarration(script, primaryTone)
    });
  }
  
  // Generate dialogue for each scene
  scenes.forEach((scene, index) => {
    // Who speaks in this scene
    const speakerOptions = [mainCharName, ...supportingCharacters.slice(0, 3)];
    const primarySpeaker = index === 0 ? mainCharName : speakerOptions[Math.floor(Math.random() * speakerOptions.length)];
    const secondarySpeaker = primarySpeaker === mainCharName 
      ? supportingCharacters[Math.floor(Math.random() * supportingCharacters.length)]
      : mainCharName;
    
    // Generate dialogue for this scene
    const sceneDialogue = generateSceneDialogue(scene, primarySpeaker, secondarySpeaker, primaryTone, index);
    dialogue.push(...sceneDialogue);
  });
  
  // Add narrator closing if appropriate
  if (Math.random() > 0.6) {
    dialogue.push({
      character: "NARRATOR",
      text: getClosingNarration(script, primaryTone)
    });
  }
  
  // Make sure we have at least 6 lines of dialogue
  if (dialogue.length < 6) {
    dialogue.push({
      character: mainCharName,
      text: "What a day! It really makes you think about what's important."
    });
    
    dialogue.push({
      character: supportingCharacters[0],
      text: "That's true. Sometimes the ordinary days turn out to be the most special ones."
    });
  }
  
  return dialogue;
}

function generateSceneDialogue(
  sceneDescription: string, 
  primarySpeaker: string, 
  secondarySpeaker: string, 
  tone: string,
  sceneIndex: number
): DialogueLine[] {
  const dialogue: DialogueLine[] = [];
  const sceneLower = sceneDescription.toLowerCase();
  
  // First line
  let firstLine = "";
  if (sceneIndex === 0) {
    // Opening line
    if (sceneLower.includes("morning") || sceneLower.includes("wake")) {
      firstLine = "It's going to be a great day today! I can feel it.";
      if (tone === "sad" || tone === "frustrated") firstLine = "Another day... let's see what happens.";
      if (tone === "excited") firstLine = "Today's going to be amazing! I've been waiting for this!";
      if (tone === "nervous") firstLine = "I hope everything goes well today. I've got so much to do.";
    } else {
      firstLine = "This is going to be interesting!";
      if (tone === "happy") firstLine = "I'm feeling really good about this!";
      if (tone === "nervous") firstLine = "I'm not sure what to expect, but here goes nothing.";
    }
  } else if (sceneLower.includes("challenge") || sceneLower.includes("problem") || sceneLower.includes("obstacle")) {
    firstLine = "This is a bit challenging, but I can handle it.";
    if (tone === "frustrated") firstLine = "Why does everything have to be so difficult?";
    if (tone === "excited") firstLine = "A challenge! This is where things get interesting!";
  } else if (sceneLower.includes("friend") || sceneLower.includes("social")) {
    firstLine = "It's so good to see you!";
    if (tone === "happy") firstLine = "Seeing friends really brightens my day!";
  } else if (sceneLower.includes("work") || sceneLower.includes("office")) {
    firstLine = "Let's focus and get this done.";
    if (tone === "excited") firstLine = "I've got some great ideas for this project!";
    if (tone === "frustrated") firstLine = "This work is never-ending, isn't it?";
  } else {
    // Generic opener based on tone
    switch (tone) {
      case "happy": firstLine = "This is turning out to be a wonderful day!"; break;
      case "sad": firstLine = "Things haven't been easy lately..."; break;
      case "excited": firstLine = "I can't believe this is happening!"; break;
      case "nervous": firstLine = "I'm not sure about this..."; break;
      case "relaxed": firstLine = "It's nice to take things slow sometimes."; break;
      case "frustrated": firstLine = "Why does everything have to be so complicated?"; break;
      default: firstLine = "Interesting how things turn out, isn't it?"; break;
    }
  }
  
  dialogue.push({
    character: primarySpeaker,
    text: firstLine
  });
  
  // Response
  let response = "";
  if (primarySpeaker === "MAIN CHARACTER") {
    // Supporting character responds
    if (sceneLower.includes("question") || firstLine.includes("?")) {
      response = "That's a good question. What do you think?";
    } else if (sceneLower.includes("achievement") || sceneLower.includes("success")) {
      response = "You should be proud of yourself! That's a real accomplishment.";
    } else if (tone === "sad" || tone === "frustrated") {
      response = "Don't worry, things will get better. They always do.";
    } else if (tone === "happy" || tone === "excited") {
      response = "I can tell you're in a good mood today!";
    } else {
      response = "I see what you mean. Life has a funny way of working out.";
    }
  } else {
    // Main character responds
    if (sceneLower.includes("advice") || sceneLower.includes("help")) {
      response = "Thanks for the advice. I really appreciate it.";
    } else if (sceneLower.includes("joke") || sceneLower.includes("funny")) {
      response = "That's hilarious! You always know how to make me laugh.";
    } else if (tone === "happy") {
      response = "You're right! Today is turning out great.";
    } else if (tone === "nervous" || tone === "frustrated") {
      response = "I'm trying to stay positive, but it's not always easy.";
    } else {
      response = "I hadn't thought of it that way. That's a good point.";
    }
  }
  
  dialogue.push({
    character: secondarySpeaker,
    text: response
  });
  
  // Optional third line for more complex scenes
  if (sceneDescription.length > 100 || Math.random() > 0.5) {
    let thirdLine = "";
    const speaker = primarySpeaker;
    
    if (response.includes("?")) {
      thirdLine = "Well, I believe everything happens for a reason.";
      if (tone === "happy") thirdLine = "I just try to focus on the positive things!";
      if (tone === "frustrated") thirdLine = "I just wish things would be simpler sometimes.";
    } else if (sceneLower.includes("reflection") || sceneLower.includes("thought")) {
      thirdLine = "It makes you reflect on what's really important, doesn't it?";
    } else if (sceneLower.includes("future") || sceneLower.includes("plan")) {
      thirdLine = "I wonder what tomorrow will bring.";
    } else {
      thirdLine = "Anyway, let's make the most of this moment.";
    }
    
    dialogue.push({
      character: speaker,
      text: thirdLine
    });
  }
  
  return dialogue;
}

function getIntroNarration(script: string, tone: string): string {
  const scriptLower = script.toLowerCase();
  
  if (scriptLower.includes("morning") || scriptLower.includes("wake")) {
    return "As the sun rises on a new day, our story begins.";
  } else if (scriptLower.includes("routine") || scriptLower.includes("ordinary")) {
    return "What seemed like an ordinary day was about to become quite special.";
  } else if (tone === "excited" || scriptLower.includes("adventure")) {
    return "Little did anyone know, today would be filled with unexpected surprises.";
  } else if (tone === "relaxed") {
    return "Sometimes the most meaningful moments come when we slow down and pay attention.";
  } else {
    return "Every day has its story. This one begins with a simple moment.";
  }
}

function getClosingNarration(script: string, tone: string): string {
  const scriptLower = script.toLowerCase();
  
  if (scriptLower.includes("lesson") || scriptLower.includes("learn")) {
    return "And so, another day ends with a valuable lesson learned.";
  } else if (scriptLower.includes("friendship") || scriptLower.includes("connect")) {
    return "Sometimes the connections we make are what truly matter in life.";
  } else if (tone === "happy" || scriptLower.includes("success")) {
    return "A day filled with small victories is a day well spent.";
  } else if (scriptLower.includes("challenge") || scriptLower.includes("overcome")) {
    return "Every challenge overcome is a step toward who we're meant to become.";
  } else {
    return "And as this day comes to a close, tomorrow waits with new possibilities.";
  }
}

export const dialogueAgent = {
  /**
   * Generates dialogue for the cartoon based on the script and characters
   */
  async generateDialogue(script: string, characters: any) {
    try {
      // First try external AI for dialogue generation
      try {
        // Create a dialogue prompt based on script and characters
        const dialoguePrompt = `
          Based on this script:
          "${script}"
          
          And these characters:
          Main character: ${characters.mainCharacterDescription}
          Supporting characters: ${characters.supportingCharactersDescription}
          
          Write a natural, conversational dialogue for a 1-minute cartoon (about 10-15 lines total).
          Include:
          - Character speech that reveals personality
          - A mix of questions, statements, and reactions
          - Natural flow between speakers
          - A narrator voice if needed
          
          Format each line as:
          CHARACTER NAME: "Dialogue text"
          
          For example:
          MAIN CHARACTER: "What a beautiful day!"
          FRIEND: "It sure is! How have you been?"
        `;

        // Try using a better model
        const dialogueResponse = await hf.textGeneration({
          model: 'mistralai/Mistral-7B-Instruct-v0.2',
          inputs: dialoguePrompt,
          parameters: {
            max_new_tokens: 500,
            temperature: 0.7,
            top_p: 0.9,
            repetition_penalty: 1.1
          }
        });

        // Process the dialogue text into structured format
        const dialogueText = dialogueResponse.generated_text;
        
        // Parse dialogue lines
        const dialogueRegex = /([A-Z\s]+):(?:\s+)"([^"]+)"/g;
        const lines: DialogueLine[] = [];
        
        let match;
        while ((match = dialogueRegex.exec(dialogueText)) !== null) {
          lines.push({
            character: match[1].trim(),
            text: match[2].trim()
          });
        }
        
        // If no lines were parsed correctly, try simpler parsing approach
        if (lines.length === 0) {
          const simpleSplit = dialogueText.split('\n')
            .filter(line => line.includes(':'))
            .map(line => {
              const [character, text] = line.split(':', 2);
              return {
                character: character.trim().replace(/[^A-Za-z\s]/g, ''),
                text: text.trim().replace(/^["']|["']$/g, '')
              };
            })
            .filter(line => line.character && line.text);
            
          if (simpleSplit.length > 0) {
            return { lines: simpleSplit };
          }
          
          // If still no valid lines, use our dynamic generator
          throw new Error("Could not parse dialogue from AI response");
        }

        return { lines };
      } catch (aiError) {
        console.log("Error generating dialogue with AI, using dynamic generator:", aiError);
        // Use our dynamic dialogue generator as fallback
        const lines = generateDynamicDialogue(script, characters);
        return { lines };
      }
    } catch (error) {
      console.error('Error in dialogue generation:', error);
      
      // If all else fails, generate dynamic dialogue based on the script
      const lines = generateDynamicDialogue(script, characters);
      return { lines };
    }
  }
};
