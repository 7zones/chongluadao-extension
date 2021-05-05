from tensorflow.keras.layers import Embedding, Flatten, Dense, LSTM, Bidirectional, Dropout, BatchNormalization, GRU, Conv1D, GlobalAveragePooling1D, GlobalMaxPooling1D
from tensorflow.keras.models import Sequential, Model
import tensorflow as tf

class ConvModel(tf.keras.Model):
  def __init__(self, num_chars, embedding_vector_length, maxlen):
    super(ConvModel, self).__init__()
    #model
    self.embedding_layers = tf.keras.layers.Embedding(num_chars, embedding_vector_length, input_length=maxlen)
    self.conv = tf.keras.layers.Conv1D(256, 4, activation='relu')
    self.fc1 = tf.keras.layers.Dense(128, activation = "relu")
    self.fc = tf.keras.layers.Dense(1, activation = "sigmoid")
  def call(self, inputs, training=False):
    embedding = self.embedding_layers(inputs)
    conv = self.conv(embedding)
    conv_max = tf.reduce_max(conv, axis = 1)
    fc1 = self.fc1(conv_max)
    output = self.fc(fc1)
    return output
