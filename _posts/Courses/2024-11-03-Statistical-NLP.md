---
layout: post
title: Statistical Natural Language Processing
categories: [Notes]
description: Enter the world of Natural Language Processing.

---

# Introduction

**Natural Language Processing (NLP)** is the study of computer systems that take as input or produce as output natural language - languages created by humans. The goal is to give machines the power to understand not just words, but entire sentences, paragraphs and documents. 

It it worth keeping in mind that the notion of "understanding" is contrived. There is no clear definition - when we claim Large Language Models (LLMs) understand our language, we really don't know if it is understanding. 

NLP develops systems for

2. Analysis of language (NL to some useful output) - text classification, question answering, etc.

3. Generation of language (NL to NL; Image to NL, etc) - summarization, image captioning, machine translation

4. Representation of language (NL to some representation) - learning word embeddings

In the part, systems were task-specific, now we have more general purpose systems capable of all of the above and more.

### Origins

Back in 1949, Warren Weaver, a wartime US mathematician and scientist, brought the idea of the first computer based application related to natural language - machine translation (MT). He considered the problem of translation as a problem in cryptography. We still use the notation of encoder and decoder in the present techniques. He developed a rule-based program to convert Russian to English. 

Over time, it became obvious that human language are **ambiguous** (unlike programming and other formal languages) and they are **rich** - any meaning may be expressed in many ways. Human language interpretation depends on the real world, common sense and **contextual knowledge**. Furthermore, there is **linguistic diversity** across genres, styles, and so more.

In 1957, Chomsky proposed a *generative grammar*, a rule based system of syntactic structures, brought insight into how linguistics can help MT. Since the results were not satisfactory, funding was cut-off and then came the winter of AI in 1966.

In 1971, Terry Winograd's MIT thesis has motivated the notion of **grounded language understanding**. In late 80's, statistical techniques revolutionized NLP. They used early ML algorithms - decision trees with rule based systems. 

From 90's to early 2000s, methods like logistic regression, Support Vector Machines (SVM), Hidden Markov Models (HMMs), Conditional Random Fields (CRFs), etc were introduced. Moreover, papers introduced feature engineering for specific tasks - POS tagging, Named Entity Recognition, Parsing, etc. 

The main language models during this time were n-grams with smoothing.

![](assets/2024-11-03-Statistical-NLP/2024-11-09-15-15-16-image.png)

### Dawn of Deep Learning Era

Bengio et al. in 2003 proposed first neural language models with 1-hidden layer feed-forward neural network. It introduced the notion of **word embeddings** with a real-valued feature vector in $$\mathbb R^d$$. In 2008, a new paper proposed training neural network along with a word embedding matrix jointly. There was no need of feature engineering anymore. 

In 2013, Mikolov et al. introduced arguably the most popular word embedding model - **Word2Vec** - they got rid of hidden layer in the model as well. 

From 2013 to 2018, Recurrent Neural Networks (RNNs; Elman 1990),  Long-Short Term Memory Models (LSTMs), Convolution Neural Networks (CNNs), recursive neural networks (Socher et al.), etc were used for NLP. There were feats of Architectural engineering as well - combining RNNS with CRFs for sequence labeling, CNNs for text classification, summarization with pointer-generators RNNs (2017). *In present date, there are little to no changes in the model architecture.*

In 2014, Google introduced **Sequence-to-sequence** learning, a general end-to-end approach for mapping one sequence to another using a single neural network (encoder-decoder architecture). This proved very important for NLP tasks going forward. It was a fundamental shift in paradigm to perform tasks like translation with a single model instead of complicated designed models. 

Then, in 2015 came the notion of **Attention** - to reduce the bottleneck of sequence-to-sequence models that was compressing the entire content of source sequence into a fixed-size vector. This notion still required sequential processing with RNNs. Finally in 2017, **Transformers** were proposed which eschewed recurrence and relied entirely on attention mechanisms. The parallel nature of the model enabled fast computations.

In 2020, people realized instead of just pre-training the word-embedding layer they could just pre-train the whole network and add a layer-head in the end if required for other specialized tasks. Pre-trained LMs then acted as an initialization for fine-tuning on downstream tasks - ELMo (Peters et al., 2018), ULMFiT (Howard and Ruder, 2018), GPT (Radford et al., 2018), and BERT (Devlin et al,. 2019). The impact of pre-training all the layers was significant.

![](assets/2024-11-03-Statistical-NLP/2024-11-09-15-15-02-image.png)

### Present Date

NLP systems are increasing used in everyday life - in the form of chatbots and other AI assistants. Consider ChatGPT - fastest growing consumer computing applications in history. 

The key advantage os language models is that there is no need of annotation - nearly unlimited training data*. People also realized that using larger and larger models gives higher performance as data scales. The final ingredient to achieve all this is compute - GPU gave a huge advantage over CPU to train these networks. These three key ingredient - hardware scalability (GPUs), Model scalability (Transformer with many deep layers) and Data scalability (Large datasets with lots of text) enabled the success of GPT models. 

![](assets/2024-11-03-Statistical-NLP/2024-11-09-15-14-43-image.png)

Realizing the power of scale, GPT1 was trained with a few million parameters and now GPT4 has a few hundred billion parameters. In 2022, researchers at OpenAI realized some tasks were only possible at larger scales - scaling LMs leads to emergent abilities. Another paper (one of the best papers in NeurIPS) questioned this asking whether this finding is just an artifact of how we designed our metrics. The metrics used in the OpenAI paper did not allow continuous rewards which caused the sudden jump in performance after a certain point in scale. With a more continuous metric, the gains due to scale increase continuously without sudden jumps.

Then came the question of prompting - how do we talk to these LMs? **Prompt** is a cue given to the pre-trained LM to allow it to better understand people's questions (Best paper in NeurIPS 2020). 

GPT3.5 introduced the notion of **Instruction Tuning** - collect examples of (instruction, output) pairs across many tasks and then evaluate on unseen tasks. Furthermore, the output of LMs can be tuned with **Reinforcement Learning with Human Feedback** (RLHF) -  explicitly attempt to satisfy human preferences using RL. This was implemented in an ingenious manner - 

![](assets/2024-11-03-Statistical-NLP/2024-11-09-15-13-21-image.png)

After adding some safety features, GPT3.5 was transformed into ChatGPT. 

**LLM as a reasoning engine** - The knowledge base of LLMs is large but incomplete. To address this limitation, they need to retrieve information from elsewhere, add it to the prompt and then ask the LLM to process it to get an answer. This is the idea behind **Retrieval Augmented Generation (RAG)** for knowledge intensive NLP tasks. The pipeline is more sophisticated, and will be described later.

### Summary

We have the following big picture - 

1. Feature Engineering in 1990s to 2000s

2. Architecture Engineering - 2010 - 2018 (LSTMs, CNNs, Transformers)

3.  Objective Engineering - 2018 (ELMo, BERT, GPT)

4. Prompt Engineering - 2020s - present (instruction-tuning, chain-of-thought, etc)


