import React, { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  ScrollView, TextInput, Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const PROJECTS_KEY = 'drishti_projects';

const getProjects = () => {
  try { return JSON.parse(localStorage.getItem(PROJECTS_KEY) || '[]'); }
  catch { return []; }
};

const saveProjects = (projects) => {
  localStorage.setItem(PROJECTS_KEY, JSON.stringify(projects));
};

const pickAndReadFile = (accept) => new Promise((resolve) => {
  const el = document.createElement('input');
  el.type = 'file'; el.accept = accept; el.style.display = 'none';
  document.body.appendChild(el);
  el.onchange = async (e) => {
    const file = e.target.files?.[0];
    document.body.removeChild(el);
    if (!file) return resolve(null);
    const reader = new FileReader();
    reader.onload = (ev) => resolve({
      name: file.name,
      type: file.type,
      size: file.size,
      content: ev.target.result,
    });
    reader.readAsText(file);
  };
  el.oncancel = () => { document.body.removeChild(el); resolve(null); };
  el.click();
});

export default function ProjectsScreen({ navigate }) {
  const [projects, setProjects] = useState([]);
  const [showNew, setShowNew] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newInstructions, setNewInstructions] = useState('');
  const [uploading, setUploading] = useState(false);

  const load = () => setProjects(getProjects());
  useEffect(() => { load(); }, []);

  const createProject = () => {
    if (!newName.trim()) return;
    const projects = getProjects();
    const p = {
      id: 'proj_' + Date.now(),
      name: newName.trim(),
      description: newDesc.trim(),
      instructions: newInstructions.trim(),
      files: [],
      createdAt: Date.now(),
    };
    projects.unshift(p);
    saveProjects(projects);
    setNewName(''); setNewDesc(''); setNewInstructions('');
    setShowNew(false); load();
  };

  const openProject = (p) => {
    localStorage.setItem('current_project_id', p.id);
    localStorage.setItem('current_session_id', `${p.id}_${Date.now()}`);
    // Set project context for AI
    const context = [];
    if (p.instructions) context.push(`Project Instructions: ${p.instructions}`);
    if (p.files?.length) {
      p.files.forEach(f => { if (f.content) context.push(`File "${f.name}":\n${f.content.slice(0, 2000)}`); });
    }
    if (context.length) localStorage.setItem('project_context', context.join('\n\n'));
    else localStorage.removeItem('project_context');
    navigate('chat');
  };

  const uploadFile = async (projectId) => {
    setUploading(true);
    const file = await pickAndReadFile('.txt,.pdf,.md,.doc,.docx,.csv');
    if (!file) { setUploading(false); return; }
    const projects = getProjects();
    const idx = projects.findIndex(p => p.id === projectId);
    if (idx === -1) { setUploading(false); return; }
    if (!projects[idx].files) projects[idx].files = [];
    projects[idx].files.push({
      name: file.name,
      size: file.size,
      content: file.content?.slice(0, 10000) || '',
      addedAt: Date.now(),
    });
    saveProjects(projects);
    setSelectedProject(projects[idx]);
    load(); setUploading(false);
  };

  const removeFile = (projectId, fileName) => {
    const projects = getProjects();
    const idx = projects.findIndex(p => p.id === projectId);
    if (idx === -1) return;
    projects[idx].files = (projects[idx].files || []).filter(f => f.name !== fileName);
    saveProjects(projects);
    setSelectedProject(projects[idx]);
    load();
  };

  const deleteProject = (id) => {
    const updated = getProjects().filter(p => p.id !== id);
    saveProjects(updated);
    setSelectedProject(null); load();
  };

  if (selectedProject) {
    const p = getProjects().find(pr => pr.id === selectedProject.id) || selectedProject;
    return (
      <View style={s.container}>
        <View style={s.header}>
          <TouchableOpacity onPress={() => setSelectedProject(null)}>
            <Text style={s.back}>← Back</Text>
          </TouchableOpacity>
          <Text style={s.title} numberOfLines={1}>{p.name}</Text>
          <TouchableOpacity onPress={() => deleteProject(p.id)}>
            <Ionicons name="trash-outline" size={20} color="#ff4444" />
          </TouchableOpacity>
        </View>

        <ScrollView style={s.scroll} showsVerticalScrollIndicator={false}>
          {/* Open Chat */}
          <TouchableOpacity style={s.openChatBtn} onPress={() => openProject(p)}>
            <Ionicons name="chatbubble-outline" size={20} color="#000" />
            <Text style={s.openChatTxt}>Open Chat in this Project</Text>
            <Ionicons name="arrow-forward" size={18} color="#000" />
          </TouchableOpacity>

          {/* Instructions */}
          <View style={s.card}>
            <View style={s.cardHeader}>
              <Ionicons name="document-text-outline" size={18} color="#00d4ff" />
              <Text style={s.cardTitle}>Instructions</Text>
            </View>
            <Text style={s.cardDesc}>
              {p.instructions || 'No instructions set. Add instructions to guide how DRISHTI behaves in this project.'}
            </Text>
          </View>

          {/* Knowledge Files */}
          <View style={s.card}>
            <View style={s.cardHeader}>
              <Ionicons name="library-outline" size={18} color="#8b5cf6" />
              <Text style={s.cardTitle}>Knowledge Files</Text>
              <Text style={s.fileCount}>{(p.files || []).length} files</Text>
            </View>
            <Text style={s.cardDesc}>
              Add files and DRISHTI will use them as context in every chat within this project.
            </Text>

            {(p.files || []).map((file, i) => (
              <View key={i} style={s.fileRow}>
                <Ionicons name="document-outline" size={16} color="#8b5cf6" />
                <View style={{ flex: 1 }}>
                  <Text style={s.fileName} numberOfLines={1}>{file.name}</Text>
                  <Text style={s.fileMeta}>{(file.size/1024).toFixed(1)} KB · {file.content?.length || 0} chars</Text>
                </View>
                <TouchableOpacity onPress={() => removeFile(p.id, file.name)} style={s.removeFile}>
                  <Ionicons name="close-circle" size={18} color="#ff4444" />
                </TouchableOpacity>
              </View>
            ))}

            <TouchableOpacity style={s.uploadBtn} onPress={() => uploadFile(p.id)} disabled={uploading}>
              <Ionicons name={uploading ? 'hourglass-outline' : 'cloud-upload-outline'} size={18} color="#8b5cf6" />
              <Text style={s.uploadTxt}>{uploading ? 'Uploading...' : 'Add File'}</Text>
            </TouchableOpacity>
          </View>

          {/* Project Info */}
          {p.description ? (
            <View style={s.card}>
              <View style={s.cardHeader}>
                <Ionicons name="information-circle-outline" size={18} color="#00d4ff" />
                <Text style={s.cardTitle}>Description</Text>
              </View>
              <Text style={s.cardDesc}>{p.description}</Text>
            </View>
          ) : null}

          <View style={{ height: 40 }} />
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={s.container}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigate('dashboard')}>
          <Text style={s.back}>← Back</Text>
        </TouchableOpacity>
        <Text style={s.title}>Projects</Text>
        <TouchableOpacity style={s.addBtn} onPress={() => setShowNew(true)}>
          <Ionicons name="add" size={22} color="#050918" />
        </TouchableOpacity>
      </View>

      <ScrollView style={s.scroll} showsVerticalScrollIndicator={false}>
        <Text style={s.hint}>
          Projects keep your chats, files, and instructions organized — like workspaces.
        </Text>

        {projects.length === 0 ? (
          <TouchableOpacity style={s.emptyState} onPress={() => setShowNew(true)}>
            <Ionicons name="folder-open-outline" size={48} color="#334155" />
            <Text style={s.emptyTitle}>No projects yet</Text>
            <Text style={s.emptyDesc}>Create a project to organize your chats and add knowledge files.</Text>
            <View style={s.emptyBtn}>
              <Text style={s.emptyBtnTxt}>+ Create Project</Text>
            </View>
          </TouchableOpacity>
        ) : projects.map(p => (
          <TouchableOpacity key={p.id} style={s.projectCard} onPress={() => setSelectedProject(p)} activeOpacity={0.8}>
            <View style={s.projectCardLeft}>
              <View style={s.projectCardIcon}>
                <Ionicons name="folder" size={20} color="#f59e0b" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.projectCardName}>{p.name}</Text>
                {p.description ? <Text style={s.projectCardDesc} numberOfLines={1}>{p.description}</Text> : null}
                <Text style={s.projectCardMeta}>{(p.files || []).length} files</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={16} color="#475569" />
          </TouchableOpacity>
        ))}
        <View style={{ height: 40 }} />
      </ScrollView>

      {/* New Project Modal */}
      <Modal visible={showNew} transparent animationType="slide">
        <View style={s.modalBg}>
          <View style={s.modal}>
            <Text style={s.modalTitle}>New Project</Text>

            <Text style={s.inputLabel}>Name *</Text>
            <TextInput style={s.input} placeholder="e.g. UPI Guide, WhatsApp Help"
              placeholderTextColor="#475569" value={newName} onChangeText={setNewName} autoFocus />

            <Text style={s.inputLabel}>Description</Text>
            <TextInput style={s.input} placeholder="What is this project about?"
              placeholderTextColor="#475569" value={newDesc} onChangeText={setNewDesc} />

            <Text style={s.inputLabel}>Instructions for DRISHTI</Text>
            <TextInput style={[s.input, { height: 90 }]}
              placeholder="e.g. Always reply in Hindi. Focus only on UPI and payment topics."
              placeholderTextColor="#475569" value={newInstructions} onChangeText={setNewInstructions} multiline />

            <View style={s.modalBtns}>
              <TouchableOpacity style={s.modalCancel} onPress={() => { setShowNew(false); setNewName(''); setNewDesc(''); setNewInstructions(''); }}>
                <Text style={s.modalCancelTxt}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[s.modalCreate, !newName.trim() && { opacity: 0.4 }]}
                onPress={createProject} disabled={!newName.trim()}>
                <Text style={s.modalCreateTxt}>Create →</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0f1e', paddingTop: 54 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 22, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: '#1e293b' },
  back: { color: '#00d4ff', fontSize: 15, fontWeight: '500' },
  title: { color: '#f1f5f9', fontSize: 17, fontWeight: '700', flex: 1, textAlign: 'center' },
  addBtn: { width: 34, height: 34, borderRadius: 10, backgroundColor: '#00d4ff', justifyContent: 'center', alignItems: 'center' },
  scroll: { flex: 1, paddingHorizontal: 22, paddingTop: 16 },
  hint: { color: '#475569', fontSize: 13, lineHeight: 20, marginBottom: 20 },
  emptyState: { alignItems: 'center', paddingVertical: 50, gap: 10 },
  emptyTitle: { color: '#cbd5e1', fontSize: 18, fontWeight: '700' },
  emptyDesc: { color: '#475569', fontSize: 13, textAlign: 'center', paddingHorizontal: 20, lineHeight: 20 },
  emptyBtn: { backgroundColor: '#8b5cf6', borderRadius: 10, paddingHorizontal: 20, paddingVertical: 10, marginTop: 8 },
  emptyBtnTxt: { color: '#fff', fontWeight: '700', fontSize: 14 },
  projectCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#131929', borderRadius: 14, padding: 16, marginBottom: 10, borderWidth: 1, borderColor: '#1e293b' },
  projectCardLeft: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 14 },
  projectCardIcon: { width: 44, height: 44, borderRadius: 12, backgroundColor: '#f59e0b15', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#f59e0b30' },
  projectCardName: { color: '#f1f5f9', fontSize: 15, fontWeight: '600', marginBottom: 3 },
  projectCardDesc: { color: '#475569', fontSize: 12, marginBottom: 3 },
  projectCardMeta: { color: '#334155', fontSize: 11 },
  openChatBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#00d4ff', borderRadius: 14, padding: 16, marginBottom: 16, gap: 10 },
  openChatTxt: { flex: 1, color: '#050918', fontSize: 15, fontWeight: '700' },
  card: { backgroundColor: '#131929', borderRadius: 14, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#1e293b' },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  cardTitle: { color: '#f1f5f9', fontSize: 14, fontWeight: '700', flex: 1 },
  fileCount: { color: '#475569', fontSize: 12 },
  cardDesc: { color: '#64748b', fontSize: 13, lineHeight: 20 },
  fileRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 10, borderTopWidth: 1, borderTopColor: '#1e293b' },
  fileName: { color: '#cbd5e1', fontSize: 13, fontWeight: '500' },
  fileMeta: { color: '#475569', fontSize: 11, marginTop: 2 },
  removeFile: { padding: 4 },
  uploadBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 12, padding: 12, borderRadius: 10, borderWidth: 1, borderColor: '#8b5cf630', backgroundColor: '#8b5cf610' },
  uploadTxt: { color: '#8b5cf6', fontSize: 14, fontWeight: '600' },
  modalBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'flex-end' },
  modal: { backgroundColor: '#131929', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 44, borderWidth: 1, borderColor: '#1e293b' },
  modalTitle: { color: '#f1f5f9', fontSize: 18, fontWeight: '800', marginBottom: 20 },
  inputLabel: { color: '#94a3b8', fontSize: 12, fontWeight: '600', marginBottom: 6, letterSpacing: 0.5, textTransform: 'uppercase' },
  input: { backgroundColor: '#0a0f1e', color: '#f1f5f9', borderRadius: 10, padding: 14, fontSize: 14, borderWidth: 1, borderColor: '#1e293b', marginBottom: 14 },
  modalBtns: { flexDirection: 'row', gap: 10, marginTop: 6 },
  modalCancel: { flex: 1, padding: 14, borderRadius: 12, backgroundColor: '#1e293b', alignItems: 'center' },
  modalCancelTxt: { color: '#64748b', fontWeight: '600', fontSize: 14 },
  modalCreate: { flex: 1, padding: 14, borderRadius: 12, backgroundColor: '#00d4ff', alignItems: 'center' },
  modalCreateTxt: { color: '#050918', fontWeight: '800', fontSize: 15 },
});
