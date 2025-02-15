# [Deep Compression: Compressing Deep Neural Networks with Pruning, Trained Quantization and Huffman Coding](https://arxiv.org/pdf/1510.00149)

Released in 2016, Deep Compression is a three stage-pipeline involving pruning, trained quantization and Huffman coding that reduce the storage of neural networks by $$35\times$$ to $$49\times$$ without affecting their accuracy! Here are these steps in detail

- **Network Pruning**- Leveraging the previous successes of pruning CNNs, the authors prune the network by removing all connections with weights below a certain threshold from the network. The model is retrained to learn optimized weights. This step reduces the number of parameters by almost $$10\times$$ for AlexNet and $$35\times$$ for VGG-16.
  
  For further storage savings, these weights are stored as a compressed sparse row/column. Moreover, the authors recommend storing the index different instead of absolute position, and they assign the bits very parsimoniously. 

- **Trained Quantization and Weight Sharing** - A quantization technique during training, that essentially shares the weights across multiple neurons. That is, the updates and computes are grouped as centroids. The compression rate with this technique is given by
  
  $$
  r = \frac{nb}{n \log_2(k) + kb}
  $$
  
  where $$k$$ is the number of clusters, $$n$$ is the number of connections in the network, and $$b$$ is the number of bits used to encode these connections. The weights are not shared across layers, and the quantization is done so  that the loss across all the weights is minimum. The weights centroids can be accessed through a hash function. 
  
  The authors go into some more detail about initializing these centroids. 
  
  - Forgy (Random) - Randomly chooses $$k$$ observations from the dataset. These centroids tend to concentrate near the peaks of the weight distribution.
  
  - Density based initialization - Starts with a uniform distribution of the centroids and then adapts to the PDF of the data distribution. The centroids still gather near the peaks but have a better spread than random initialization. 
  
  - Linear initialization - Most scattered initialization
  
  Why do these matter? In many cases, the larger weights are important but they usually are fewer in number. So, the first two initializations that are centered around the distribution peaks (which are not the large values) can result in poor accuracy. So, linear initialization usually works the best. They also experimentally confirm these hypotheses. 

- **Huffman Coding** - Huffman encoding is the optimal encoding standard that relies on a common prefix code for lossless data compression. The intuition is that more common symbols are represented with fewer bits. The authors of this paper use this idea to encode the sparse matrix formed by the quantized weights. The distributions are usually bi-modal and Huffman encoding saves 20-30% in storage with these non-uniform distributions. 

Overall, with all these methods combined, the pipeline saves over $$30\times$$ in storage for many image models! What's more? The accuracy is more or less the same as the original models!

The authors analyze a bit more on how these methods work together with one another. They noticed that the accuracy of the networks starts dropping sharply after a certain threshold in each method. 

![](/assets/img/Machine Learning Systems/reading05/2025-02-12-18-35-58-image.png)

They also point out that quantization works well with pruned networks due to lesser number of parameters to quantize. In fact, they notice that pruning virtually does not affect the performance obtained after quantization. Basically, with more savings, you get the same performance. 

The target of this paper is to allow models to work on edge devices. They perform experiments on latency, especially with the fully connected layers since they occupy 90% of the parameters in the networks. One must note that benchmarking quantized models is difficult since there are no hardware primitives to support the lookup architecture for centroid codes. They have the following observations

1. Matrix vector multiplications are more memory-bound than matrix matrix multiplications, and so reducing the memory-footprint for non-batched inferences is important. 

2. Pruned networks had $$3\times$$ speed-up since larger matrices are able to fit into the caches. 

3. They also note that the effect of the quantization codebook is negligible as compared to the other operations. 

In the future, they emphasize that to take full-advantage of the method, hardware must support indirect matrix entry lookup and the relative indices in CSC and CSR formats. This can be achieved via custom software kernels or hardware primitives. 

# [A survey of Quantization methods for Efficient Neural Network Inference](https://arxiv.org/abs/2103.13630)

The research and development of efficient ML has been a constant interest alongside developing new ML architectures. The earlier works in this space include:

- Optimizing the micro-architecture (such as depth-wise convolution, low-rank factorization) and macro-architecture (residual connections, inception). These methods have been a result of manual search that is not scalable. A new line of work called AutoML and Neural Architectural Search methods was developed to automate the search of the right ML architecture under the given constraints of model size. Another line of work in ML compilers tried to optimize a particular architecture for a specific hardware. 

- **Pruning** the models by removing the neurons with small saliency (sensitivity - that do not affect the result of the network largely). These methods can be categorized as 
  
  - Unstructured - Removes neurons with smaller saliency wherever they occur - this tends to be aggressive while having little impact to performance. However, this approach leads to sparse matrix operations that are harder to accelerate and are memory bound. 
  
  - Structured - A group of parameters (e.g., entire convolutional filter) is removed so that the operations are still on dense matrices. 

- **Knowledge distillation** refers to training large models and using it as a teacher to train a compact model. The idea is to use the soft-probabilities generated by the teacher to better train a small model, resulting in high compression. This class of methods can significantly reduce the model size with little to no performance degradation. 

- **Quantization** has showed consistent success for both training and inference of Neural Networks. It allowed breakthroughs such as half-precision and mixed prevision training to have a high throughput in AI accelerators. 
  
  Quantization is loosely related to some works in neuroscience which suggest that information stored in continuous form will inevitably get corrupted by noise. However, discrete signal representations can be more robust. 

Quantization is mainly useful for deploying models on edge devices. Quantization, combined with efficient low-precision logic and dedicated deep learning processors can really push edge processors.

## History of Quantization

Quantization maps input values in a large (often continuous) set to output values in a small (often finite) set. The effect of quantization and its use in coding theory was formalized with the seminal paper by Shannon in 1948. It evolved into different concepts such as Pulse Code Modulation in signal processing. 

In digital systems, numerical optimization methods showed that having quantization effects produces roundoff errors in applications that we know to have closed form solutions. These realizations led to a shift towards approximation algorithms. 

Neural Network (NN) quantization is different from these earlier considerations. Since inference and training of NNs is expensive and NNs are typically over-parameterized, there is a huge opportunity to reduce the precision without impacting accuracy. The nature of NNs allows high error/distance between quantized and non-quantized models.  Also, the layered nature of NNs allows exploration of more types of quantizing techniques.

There are two kinds of quantization

1. **Uniform quantization** - $$Q(r) = Int(r/S) - Z$$ where $$Q$$ is the quantization operator, $$r$$ is a real valued input (activations and weights), $$S$$ is a real-valued scaling factor and $$Z$$ is an integer zero-point. The resulting quantized values are uniformly spaced. An important factor is the choice of the scaling factor $$S$$. It is determined by the clipping range that can be determined from calibration.  Based on the clipping range, symmetric quantization results in easier implementation since it results in $$Z = 0$$. These calibration ranges can be computed dynamically for every activation map or done statically during inference. 

2. **Non-uniform quantization** - Essentially, the quantized values are not necessarily uniformly spaced. It typically achieves higher accuracy for cases involving non-uniform distributions. Neural networks usually have bell-shaped distributions with long tails. These methods can be generally considered as optimizing the difference between the original tensor and quantized counterpart. The quantizer itself can also be jointly trained with the model parameters. 
   
   These prior approaches can be classified as rule-based and optimization-based quantizations. In addition, there can be clustering based quantizations such as K-means to minimize the performance loss. 



The granularity of quantization is also an important choice - 

1. Layerwise quantization - The clipping range is determined by considering all the weights in convolutional filters of a layer. 

2. Groupwise quantization - The clipping range is determined by grouping multiple channels inside a layer to account for cases where the distribution of the parameters across a single convolution/activation varies a lot. 

3. Channelwise quantization - Each channel is assigned a dedicated scaling factor. 

4. Sub-channelwise quantization - Each channel is partitioned into groups that have their own scaling factor. 



These quantization methods can also be applied during training and after training

1. **Quantization-aware training (QAT)** - The NN is re-trained with quantized parameters to improve the accuracy that degrades due to the perturbations caused by quantization. In one such method, the forward and backward passes are performed on the quantized model in floating point and then quantized after each gradient update. The back-propagation through a quantization operator is approximated via *Straight-Through Estimator (STE)* that ignores the rounding operation and approximates with an identity operation. It often works well in practice except for binary quantization. Other approaches include combinatorial optimization, target propagation or Gumbel-softmax. There has been a lot of work with regards to this aspect of quantization. 
   
   The other kind of approaches tried learning quantization parameters during the training. These are recent works and there is not much to summarize here. In summary QAT methods require retraining efforts which may not be worth it for short-lived models.

2. **Post-training quantization (PTQ)** - In contrast to QAT, the overhead is very low, does not require retraining, and it can be applied in situations where data is limited or unlabeled. However, it comes at a cost of lower accuracy. To prevent this, many approaches were proposed - bias correction methods for post-quantization ranges, analytically optimizing the clipping ranges, L2 distance optimization, outlier channel splitting, adaptive rounding methods, etc. 

3. **Zero-shot quantization** - In cases where the original data is not available to find the clipping range, zero shot quantization is used. It can again be classified into two levels based on if the approach has fine-tuning after quantization. Some approaches try to generate synthetic data to mimic the real data (earlier approaches included GANs for this) and calibrate the clipping ranges. In summary, these methods are useful for Machine Learning as a Service providers where security and privacy are a concern. 

Finally, there is a notion of stochastic quantization wherein the floating numbers are mapped up or down with a probability associated to the magnitude of the weight update. Phew, that finishes the background. 

## Quantization below 8 bits

- **Simulated and Integer-only Quantization** - Simulated quantization refers to storing parameters as lower precision but carrying out calculations as floating point. This method can lead to higher stability while training and better inference performance, but results in mixed representation calculations. It is useful for problems that are bandwidth-bound rather than compute-bound such as in recommendation systems. The latter method which uses only a single format can exploit some hardware optimizations and be more energy efficient. 

- **Mixed-Precision Quantization** - In this method, each layer is quantized with different bit precision to improve the accuracy. Searching the mixed-precisions for the layers is essentially a search problem. Researchers have tried RL abased exploration methods or using a neural network to achieve this, but these can be computationally intensive with their performance being sensitive to hyperparameters and initialization. 
  
  Another class of mixed-precision methods uses periodic function regularization by automatically distinguishing different layers and their importance wrt accuracy to learn their bandwidths. Some approaches also proposed a linear programming formulation for this approach. With hardware supporting these types of methods, it can be a feasible option for many cases. 

- **Hardware Aware Quantization** - Essentially considering hardware factors such as on-chip memory, bandwidth and cache hierarchy to choose the quantization parameters. Again, it is a search problem. 

- **Distillation-Assisted Quantization** - Some approaches tried to use model distillation to boost quantization accuracy. This method has to be studied separately since it was not covered in the survey.

- **Extreme Quantization** - Binarization. Many researchers have been bold enough to try this. Important works include 
  
  - Binary Connect - Weights are +1 or - 1
  
  - Binarized NN - Binarizes both activations and weights. Has improved latency due to matrix multiplications being replaced by XNORs and bit-counting. 
  
  - XNOR-Net - Same as before but the weights have a scaling factor. Further works noted that weights tend to be close to 0, and adopted a ternarization (yes, that's a word).
  
  Nevertheless, these result in significant performance degradation. The works in this field can be classified as Quantization error minimization, Improved loss function formulations, and improved training methods. People tried to do this with BERT and GPT models as well!

- **Vector Quantization** - Borrowing ideas from signal processing, these approaches include clustering weights or methods such as product quantization that subgroups the vectors. 



## Future Directions, Summary and Conclusion

1. Quantization should be provided as a plug-and-play module in software packages to improve the accessibility.

2. Hardware and Neural networks should be co-designed to optimize the computations. 

3. As mentioned in the previous article, coupling compression methods can have a huge impact!
   
   
