import React, { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  ScrollView, TextInput, Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getProjects, createProject, deleteProject, getAllSessions, setCurrentProjectId, createSession } from '../services/projectService';

export default function ProjectsScreen({ navigate }) {
  const [projects, setProjects] = useState([]);
  const [showNew, setShowNew] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');

  const load = () => setProjects(getProjects());
  useEffect(() => { load(); }, []);

  const handleCreate = () => {
    if (!newName.trim()) return;
    createProject(newName.trim(), newDesc.trim());
    setNewName(''); setNewDesc(''); setShowNew(false);
    load();
  };

  const openProject = (project) => {
    setCurrentProjectId(project.id);
    createSession(project.id);
    navigate('chat');
  };

  const handleDelete = (id) => {
    if (window.confirm('यह project और इसकी सारी chats delete होंगी?')) {
      deleteProject(id); load();
    }
  };

  const getSessionCount = (projectId) =>
    getAllSessions(projectId).length;

  return (
    <View style={s.container}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigate('dashboard')}>
          <Text style={s.back}>← वापस</Text>
        </TouchableOpacity>
        <Text style={s.title}>📁 Projects</Text>
        <TouchableOpacity onPress={() => setShowNew(true)} style={s.addBtn}>
          <Ionicons name="add" size={22} color="#000" />
        </TouchableOpacity>
      </View>

      <ScrollView style={s.scroll} showsVerticalScrollIndicator={false}>
        <Text style={s.hint}>
          Project = एक topic का पूरा context। AI हमेशा उसी topic पर रहेगी — जैसे Claude में होता है।
        </Text>

        {projects.length === 0 ? (
          <View style={s.empty}>
            <Ionicons name="folder-open-outline" size={60} color="#1a3a6a" />
            <Text style={s.emptyTxt}>कोई project नहीं है</Text>
            <Text style={s.emptySub}>+ से नया project बनाओ</Text>
            <TouchableOpacity style={s.createBtn} onPress={() => setShowNew(true)}>
              <Text style={s.createBtnTxt}>+ नया Project बनाओ</Text>
            </TouchableOpacity>
          </View>
        ) : (
          projects.map(p => (
            <TouchableOpacity key={p.id} style={s.card} onPress={() => openProject(p)}>
              <View style={s.cardLeft}>
                <View style={[s.cardIcon, { backgroundColor: p.color || '#1a3a6a' }]}>
                  <Ionicons name="folder" size={22} color="#00d4ff" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={s.cardName}>{p.name}</Text>
                  {p.description ? <Text style={s.cardDesc} numberOfLines={1}>{p.description}</Text> : null}
                  <Text style={s.cardMeta}>{getSessionCount(p.id)} conversations</Text>
                </View>
              </View>
              <TouchableOpacity onPress={() => handleDelete(p.id)} style={s.delBtn}>
                <Ionicons name="trash-outline" size={16} color="#ff4444" />
              </TouchableOpacity>
            </TouchableOpacity>
          ))
        )}
        <View style={{ height: 40 }} />
      </ScrollView>

      <Modal visible={showNew} transparent animationType="slide">
        <View style={s.modalBg}>
          <View style={s.modal}>
            <Text style={s.modalTitle}>📁 नया Project</Text>
            <TextInput
              style={s.modalInput}
              placeholder="Project का नाम (जैसे: UPI Guide, WhatsApp Help)"
              placeholderTextColor="#3a5a8a"
              value={newName}
              onChangeText={setNewName}
              autoFocus
            />
            <TextInput
              style={[s.modalInput, { height: 80 }]}
              placeholder="Description (optional) — यह AI को बताएगा इस project के बारे में"
              placeholderTextColor="#3a5a8a"
              value={newDesc}
              onChangeText={setNewDesc}
              multiline
            />
            <View style={s.modalBtns}>
              <TouchableOpacity style={s.cancelBtn} onPress={() => { setShowNew(false); setNewName(''); setNewDesc(''); }}>
                <Text style={s.cancelTxt}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[s.createBtn2, !newName.trim() && { opacity: 0.4 }]}
                onPress={handleCreate} disabled={!newName.trim()}>
                <Text style={s.createTxt2}>बनाओ →</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#050918', paddingTop: 50 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingBottom: 15, borderBottomWidth: 1, borderBottomColor: '#0d1f3c' },
  back: { color: '#00d4ff', fontSize: 15, width: 60 },
  title: { color: '#fff', fontSize: 18, fontWeight: '900' },
  addBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#00d4ff', justifyContent: 'center', alignItems: 'center' },
  scroll: { flex: 1, padding: 16 },
  hint: { color: '#4a7aaa', fontSize: 13, lineHeight: 20, backgroundColor: '#0d1f3c', borderRadius: 12, padding: 14, marginBottom: 16, borderWidth: 1, borderColor: '#1a3a6a' },
  empty: { alignItems: 'center', marginTop: 60, gap: 12 },
  emptyTxt: { color: '#4a7aaa', fontSize: 18, fontWeight: '700' },
  emptySub: { color: '#2a4a6a', fontSize: 14 },
  createBtn: { backgroundColor: '#00d4ff', borderRadius: 12, paddingHorizontal: 24, paddingVertical: 12, marginTop: 8 },
  createBtnTxt: { color: '#000', fontWeight: '800', fontSize: 15 },
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#0d1f3c', borderRadius: 14, padding: 16, marginBottom: 10, borderWidth: 1, borderColor: '#1a3a6a' },
  cardLeft: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 14 },
  cardIcon: { width: 46, height: 46, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  cardName: { color: '#fff', fontSize: 16, fontWeight: '700' },
  cardDesc: { color: '#4a7aaa', fontSize: 12, marginTop: 2 },
  cardMeta: { color: '#00d4ff', fontSize: 11, marginTop: 4 },
  delBtn: { padding: 8 },
  modalBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'flex-end' },
  modal: { backgroundColor: '#0d1f3c', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40, borderWidth: 1, borderColor: '#1a3a6a' },
  modalTitle: { color: '#fff', fontSize: 18, fontWeight: '900', marginBottom: 16 },
  modalInput: { backgroundColor: '#050918', color: '#fff', borderRadius: 12, padding: 14, fontSize: 14, borderWidth: 1, borderColor: '#1a3a6a', marginBottom: 12 },
  modalBtns: { flexDirection: 'row', gap: 10, marginTop: 8 },
  cancelBtn: { flex: 1, padding: 14, borderRadius: 12, backgroundColor: '#050918', alignItems: 'center', borderWidth: 1, borderColor: '#1a3a6a' },
  cancelTxt: { color: '#4a7aaa', fontWeight: '600' },
  createBtn2: { flex: 1, padding: 14, borderRadius: 12, backgroundColor: '#00d4ff', alignItems: 'center' },
  createTxt2: { color: '#000', fontWeight: '800', fontSize: 15 },
});
