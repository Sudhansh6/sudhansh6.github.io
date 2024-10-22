### Query-Key-Value Attention

The mechanisms described previously are implemented by projecting tokens into queries, keys and values. Each of these are a vector of dimensions $p$, where $p < d$. The **query** vector for the question is used to weigh the **key** vector for each token to obtain the **values**. This is done via computing the similarity between query and each key, and then the *attention* is given by the extent of similarities, normalized with softmax. The output token is obtained by summing all value vectors with weights assigned from the previous calculations. Roughly, the process looks like -

$$
\left. 
\begin{align*}
q = W_q t \\ 
K_i = W_k t_i 
\end{align*}
\right\} \implies s_i = q^T k_i \\ 
a_i = softmax(s_i) \\
t_{out} = \sum a_i v_i
$$

The purpose of "values" is to 'project' back the similarities between queries and keys to the 'token space'. 

Also note that, if the patch-size is too large, then we might lose the information within the patches. This is a tradeoff, and the decision is made based on the task at hand. For example, classification may work with large patches but tasks such as segmentation may not.

#### Self-Attention

How do we learn implicit representations that can work with general queries? We compute *self-attention* using the image tokens as the queries - information derived from the image itself. How does this process help us? For example, if we are performing instance segmentation of an image with horses. Then, the concept of 'horse' is learned by attending more to tother horse tokens and less to background. Similarly, 'a particular instance' is learned by attending less to the tokens from other horses. When we do this for all pairs across $$N$$ tokens gives us an $$N \times N$$ attention matrix. 

<img src="https://jalammar.github.io/images/t/self-attention-matrix-calculation.png" title="" alt="" width="307">

<img src="https://jalammar.github.io/images/t/self-attention-matrix-calculation-2.png" title="" alt="" width="393">

Typically, this matrix is computed in the **encoder** part of a transformer. This matrix is then used in the decoder with an input query to obtain the required results. 

### Encoders

An encoder of a transformer typically consists of many identical blocks connected serially with one another. Each such encoder block, computes a self-attention matrix and passes it through a feed-forward neural network, and they need to be applied across all the tokens in the input. Since the embeddings of tokens are independent of one another, each level of encoder blocks can be applied *in parallel* to all the tokens (patches in vision transformers) to obtain the embeddings. Such parallel computations were not possible in previous models like RNNs, which heavily relied on sequential dependencies. 

The original transformers paper normalizes the similarities with $$\sqrt{N}$$ where $$N$$ is the embedding dimension.  This allows the gradients to stabilise and gives much better performance. This a simplified view of the mechanisms used in transformers. 

In addition to these, transformers also use *positional encoding* to encode the position of the tokens in the input sequence. In the context of images, is encodes where each patch occurs in the image.  

![](C:\Users\ITSloaner\AppData\Roaming\marktext\images\2024-04-10-18-07-17-image.png) 

Positional encoding is usually done via sinusoidal functions. Other "learning-based" representations have been explored but they don't have much different effect. This encoding structure allows extrapolation to sequnce lengths not seen in training.

They also have *multi-head attention* which is equivalent to multiple channels in CNNs. That is, it allows patches to output more than one type of information. 

![](https://jalammar.github.io/images/t/transformer_multi-headed_self-attention-recap.png)

This [blog](https://jalammar.github.io/illustrated-transformer/) explains these mechanisms in-depth for interested readers. In summary, the functions of the encoder is visualized as

![](https://jalammar.github.io/images/t/transformer_resideual_layer_norm_3.png)

### Decoders

A decoder block is similar to an encoder block, with auto-regressive . The attention values learned in Encoders are used as 'keys' in the decoder attention block. This is called as *cross attention*. 

## Vision-Transformers

Vision transformers build on the same ideas used in a transformer. Typically, they use only the encoder part of the architecture where patches are extracted from images and are flattened to form the tokens for the attention mechanism. They are usually  projected using a linear layer or a CNN before performing the calculations. Apart from this, vision transformers also include an additional *class token* in the embeddings to help learn the global information across the image.  
