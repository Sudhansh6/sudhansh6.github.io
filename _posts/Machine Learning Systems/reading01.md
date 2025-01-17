# Introduction

As with every other article, this one starts with the same remark too - We are at an inflection point in human history. Artificial Intelligence (AI) is everywhere, and its growth has been unparalleled. We are in the AI revolution.

At times like these, it is important to think about the future - how do we create systems that work alongside humanity to tackle the biggest problems life faces? We must master a new field of engineering to maintain this unprecedented pace.

## History of AI

![](assets/reading01/2025-01-16-17-56-14-image.png)

Starting with symbolic AI, one of the early approaches, STUDENT system developed by Daniel Bobrow in 1964, demonstrated natural language understanding by converting English text into algebraic equations. However, it was a rule-based system that was very brittle to the grammatical structure - although the solution may appear intelligent, it did not have a genuine understanding of language or the actions it was taking. This issue is the primary problem behind rule-based approaches.

Then followed expert systems in 1970s, which focused on domain specific problems over generalized AI. For example, MYCIN developed by Stanford showed a major leap in medical AI with it's 600 rules-based system. Nevertheless, scaling these rules with newer discoveries is infeasible.

### Statistical Learning

In the 1990s, something radical happened - the field moved away from rules to data-driven approaches. With the digital revolution, new capabilities got unlocked. From regression to neural networks, we allowed machines to discover patterns in the data leading to diverse applications. This new paradigm changed the way we approached machine learning. Quality of data, metrics to evaluate performance and trade-offs in design choices - all became relevant research questions. 

During the 2000s, algorithms like decision trees and KNNs made their way into practical applications. SVMs with their "kernel trick" became very popular. Human engineered features combined with statistical learning was the characteristic in the algorithms, and they had strong mathematical foundations as well. The models performed well with limited data, and produced reliable results. Even modalities like face detection with Viola-Jones algorithm (2001) became feasible. 

### Deep Learning

A double-edged sword, deep learning became the new kid in the block since the 2010s. Deep learning networks automatically discovered features in the data, doing away with feature engineering. Starting with AlexNet in 2012, the successes with deep learning models have never been shy. Researchers realized that bigger models equals better performance. Now, in the 2020s, we have entered the age of large models which have parameters reaching into few hundreds of billions! The datasets are well into the Petabytes stage.

The three pillars required for these models to be successful, big data, better compute, and algorithmic breakthroughs, have successfully been put in place over the past few decades. 

These new depths have raised important questions about the future: how do we store and serve such models and datasets?! 

## ML Systems Engineering

It is the discipline of designing, implementing, and operating AI systems across computing scales. A machine learning system is an integrated computing system with three main parts - data, models and the compute infrastructure. 

Software Engineering as a field has been well established over the past decade. Even though the field is not yet mature, it has practices in place to enable reliable development, testing and deployment of software systems. However, these ideas are not entirely applicable to Machine Learning systems. Changes in the data distribution can alter the system behavior - this is a new paradigm we have not addressed before. 

More than often, the performance requirements guide the design decisions in the architecture. The complexities arise due to the broad spectrum across which ML is deployed today - from edge-devices to massive GPU-cloud clusters, each presents unique challenges and constraints.  Operational complexities increase with system distribution. Some applications may have privacy requirements. The budget of the system acts as an important constraint. All these tradeoffs are rarely simple choices. 

Modern ML systems must seamlessly connect with existing software, process diverse data sources, and operate across organizational boundaries, driving new approaches to system design. FarmBeats by Microsoft, Alphafold by Deepmind and Autonomous vehicles are excellent examples of how proper systems in place can really push the extent of ML applicability. 

## Challenges

1. Data Challenges - How do we store and process different kinds of data, and how to accommodate patterns with time?

2. Model Challenges - How do we create efficient systems for different forms of learning, and test their performance across a wide range of scenarios?

3. Systems Challenges - How do we set up pipelines in place to combine all of this in place? Systems that have monitoring and stats, that allow model updates and handle operational challenges.

4. Ethical and Social Considerations - How do we address bias in such large-scale models? Can we do something about the "black-box" nature? Can we handle data privacy and handle inference attacks?

A major solution to address all these challenges has been to *democratize AI technology*. Similar to an "all hands-on deck" solution, with the involvement of a large amount of people in this evolution, we are tackling one of the most innovative problem's humanity has ever faced - how do we achieve AGI?

# DNN Architectures

Assuming the reader's know enough about different model architectures, we shall now discuss the core computations involved in these models to design the systems around them. 

## Architectural Building Blocks

So far, we have the following major architectures summarized below -

### Multi-Layer Perceptrons (MLPs)

- Purpose: Dense pattern processing

- Structure: Fully connected layers

- Key operation: Matrix multiplication

- System implications:
  
  - High memory bandwidth requirements
  - Intensive computation needs
  - Significant data movement

### Convolutional Neural Networks (CNNs)

- Purpose: Spatial pattern processing

- Key innovations: Parameter sharing, local connectivity

- Core operation: Convolution (implemented as matrix multiplication)

- System implications:
  
  - Efficient memory access patterns
  - Specialized hardware support (e.g., tensor cores)
  - Opportunity for data reuse

### Recurrent Neural Networks (RNNs)

- Purpose: Sequential pattern processing

- Key feature: Maintenance of internal state

- Core operation: Matrix multiplication with state update

- System implications:
  
  - Sequential processing challenges
  - Memory hierarchy optimization for state management
  - Variable-length input handling

### Transformers and Attention Mechanisms

- Purpose: Dynamic pattern processing

- Key innovation: Self-attention mechanism

- Core operations: Matrix multiplication and attention computation

- System implications:
  
  - High memory requirements
  - Intensive computation for attention
  - Complex data movement patterns

Some innovations like skip connections, normalization techniques, and gating mechanisms are highlighted as important building blocks that require specific architectures. With these in mind, we require the following primitives -

- **Core Computational Primitives** -Matrix multiplication, Sliding window operations, Dynamic computation

- **Memory Access Primitives** - Sequential access, Strided access, Random access

- **Data Movement Primitives** - Broadcast, Scatter, Gather and Reduction

We address these primitives, by designing efficient systems as well as hardware. 

- **Hardware** - Development of specialized processing units (e.g., tensor cores), Complex memory hierarchies and high-bandwidth memory, Flexible interconnects for diverse data movement patterns

- **Software** - Efficient matrix multiplication libraries, Data layout optimizations, Dynamic graph execution support

## Conclusion

In summary, understanding the relationship between high-level architectural concepts is important for their implementation in computing systems. The future advancements in deep learning will likely stem from both novel architectural designs and innovative approaches to implementing and optimizing fundamental computational patterns.
