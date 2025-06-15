## **Inspiration**

We were inspired by how many people, especially teenagers and students struggle to express themselves or their emotions. I've experienced the power of journaling first hand, so we decided to upgrade it and allow your journal to listen, understand and support you.

## **What it does**

It is a Natural Language Processing (NLP) powered journaling web tool for emotional well-being through writing, reflection, statistics and tailor-made suggestions. It also provides statistics for you to view trends and improve your mental health. 

## **How we built it**

We started by designing the frontend in Figma. Here's a snippet of the Figma file used to design this project. I tried to incorporate a calm and tranquil theme into the website to create a safe space to describe your thoughts. 

After that, we used vanilla HTML, CSS and JavaScript for the frontend. The main page includes a section to view and select your entries and their mood scores, which are dynamically updated from certain keywords and themes present in each. When the user types their entry and clicks save, a few things happen. The mood score is detected, and if it is below 20 or very negative, it is flagged with a warning symbol, prompting users to get help. Moreover, there are suggested prompts to guide what you write and promote reflection. In the stats page, you can see different statistics such as total and weekly entries, average mood score, mood distribution with a unique emoji view, a time-sentiment graph to view your emotions changing over time, helpline numbers and a JotMe suggestion, which is a custom suggestion based on your entries and data to allow action to be taken.

For the backend, the journal entry first passes to the [KeyBERT](https://www.kaggle.com/code/zuraiz/keybert) model to extract relevant keywords. Then, a simple graph is constructed to show the relations between different words in the entry to help the model identify the context; this helps the model from discerning sarcasm, metaphors and other language wordplays, commonly found in informal text. After that, using a [pre-trained model](https://huggingface.co/j-hartmann/emotion-english-distilroberta-base) fine-tuned to identify emotions in English text, we score the sentiment of the entry based on predefined weights. After that, all the data is stored inside a file and allows users to read it.

## **Challenges we ran into**

One of the hardest challenges was the frontend and backend are written separately. We had to merge together our code and use JS to bridge the gap between Python and HTML frontend. We’re from different time zones too, so that makes collaborating hard as we have to sync up and work on the same project. We worked around it by splitting the project into chunks after discussion and taking on different parts of the project. 

## **Accomplishments that we're proud of**

Although our codebases were separated, we managed to merge them together without significant bugs. Also, we worked from different time zones and finished our work scopes without dragging the other sections. 

## **What we learned**

The most important thing is that we learned how to work together\! We started off as complete strangers and got to know each other hours before the hackathon started. We also learned how to collaborate as a team and work on different parts of the project to enhance our productivity since we have different strengths and weaknesses. Lastly, from the technical part, we learned how to integrate NLP technologies into web apps, and how easy it is to integrate machine learning and improve user experience.

## **What's next for JotMe**

Next, we will add user authentication and the option for users to store their journal entries in the cloud. However, for those wanting a bit more privacy, a local storage feature will still be available. Moreover, we shall unify the code into one installable package so that users will not need to worry about running different files on different OS.