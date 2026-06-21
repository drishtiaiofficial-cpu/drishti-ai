import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export default class ErrorBoundary extends React.Component {
  state = { hasError: false, error: null };
  static getDerivedStateFromError(error) { return { hasError: true, error }; }
  componentDidCatch(error, info) { console.log('DRISHTI Error:', error, info); }
  render() {
    if (!this.state.hasError) return this.props.children;
    return (
      <View style={s.container}>
        <Text style={s.icon}>⚠️</Text>
        <Text style={s.title}>कुछ गड़बड़ हई</Text>
        <Text style={s.msg}>{this.state.error?.message?.slice(0,100)}</Text>
        <TouchableOpacity style={s.btn} onPress={() => this.setState({ hasError: false, error: null })}>
          <Text style={s.btnTxt}>दबारा try करो</Text>
        </TouchableOpacity>
      </View>
    );
  }
}
const s = StyleSheet.create({
  container: { flex:1, backgroundColor:'#050918', justifyContent:'center', alignItems:'center', padding:30 },
  icon: { fontSize:50, marginBottom:16 },
  title: { color:'#fff', fontSize:20, fontWeight:'900', marginBottom:8 },
  msg: { color:'#4a7aaa', fontSize:13, textAlign:'center', marginBottom:24, lineHeight:20 },
  btn: { backgroundColor:'#00d4ff', borderRadius:12, paddingHorizontal:28, paddingVertical:14 },
  btnTxt: { color:'#000', fontSize:15, fontWeight:'800' },
});
