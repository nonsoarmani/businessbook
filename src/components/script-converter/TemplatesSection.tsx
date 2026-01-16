"use client";

import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

interface TemplatesSectionProps {
  onLoadTemplate: (script: string) => void;
}

const templates = [
  {
    name: "Comedy Skit Template",
    script: `[SCENE: Living Room - Day]
SARAH: "Hey Mark, have you seen my lucky socks?"
MARK: (from behind the couch, muffled) "Uh... no? Why?"
[Sarah walks over to the couch, Mark is wearing her tiny, rainbow-striped socks on his ears]
SARAH: "MARK!"
MARK: (sheepishly) "They help me hear better!"
[Sarah facepalms, Mark winks at camera]`,
  },
  {
    name: "POV Video Template",
    script: `[SCENE: Coffee Shop - Morning]
[POV: You walk into a bustling coffee shop, the aroma of coffee fills the air]
BARISTA: "Welcome! What can I get for you?"
[POV: You glance at the menu, then back at the barista, smiling]
BARISTA: (blushing) "Just let me know when you're ready."
[POV: You pick up a pastry, then look for a seat]`,
  },
  {
    name: "Storytime Template",
    script: `[SCENE: Bedroom - Night]
[Person sits on bed, looking thoughtful]
PERSON: "So, you'll never believe what happened to me last Tuesday."
[Flashback: Person is at a grocery store, looking confused at a pineapple]
PERSON: "I was just trying to buy some fruit..."
[A squirrel suddenly jumps onto the pineapple, startling the person]
PERSON: (screams) "AHH!"
[Back to bedroom, person shivers]
PERSON: "And that's why I only eat bananas now."`,
  },
  {
    name: "Before & After Template",
    script: `[SCENE: Messy Desk - Day]
[Wide shot of a very cluttered desk: papers everywhere, old coffee cups, tangled wires]
[Insert shot: A single, dusty keyboard]
[Transition shot: Fast-forward effect]
[SCENE: Clean Desk - Day]
[Wide shot of the same desk, now perfectly organized, minimalist setup]
[Close-up: A sparkling clean monitor]
[Person smiles, satisfied]`,
  },
];

const TemplatesSection = ({ onLoadTemplate }: TemplatesSectionProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Templates</CardTitle>
        <CardDescription>Load pre-built scripts to get started quickly.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-wrap gap-2">
        {templates.map((template) => (
          <Button
            key={template.name}
            variant="outline"
            onClick={() => onLoadTemplate(template.script)}
            className="flex-1 min-w-[150px]"
          >
            {template.name}
          </Button>
        ))}
      </CardContent>
    </Card>
  );
};

export default TemplatesSection;