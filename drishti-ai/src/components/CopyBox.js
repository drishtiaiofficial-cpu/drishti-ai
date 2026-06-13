import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity,
  StyleSheet, Clipboard,
} from 'react-native';

export default function CopyBox({ text, label }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    Clipboard.setString(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <Text style={styles.label}>{label || '📋 Copy करो'}</Text>
        <TouchableOpacity
          style={[styles.btn, copied && styles.btnDone]}
          onPress={handleCopy}
        >
          <Text style={styles.btnText}>
            {copied ? '✅ Copied!' : '📋 Copy'}
          </Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.content}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#0a1628',
    borderRadius: 10,
    padding: 12,
    marginTop: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#00d4ff',
    borderWidth: 1,
    borderColor: '#1a3a6a',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  label: { color: '#4a7aaa', fontSize: 11, fontWeight: '600' },
  btn: {
    backgroundColor: '#0d1f3c',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#1a3a6a',
  },
  btnDone: {
    borderColor: '#10b981',
    backgroundColor: '#0d2a1a',
  },
  btnText: { color: '#00d4ff', fontSize: 11, fontWeight: '600' },
  content: { color: '#ffffff', fontSize: 13, lineHeight: 20 },
});
