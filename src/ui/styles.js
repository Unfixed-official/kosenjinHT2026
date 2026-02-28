import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f8ff',
    padding: 16
  },
  section: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#d4def5'
  },
  title: {
    color: '#1f2a44',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 10
  },
  text: {
    color: '#334155'
  },
  input: {
    backgroundColor: '#eef4ff',
    color: '#1f2a44',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#c7d2fe'
  },
  button: {
    backgroundColor: '#7dd3fc',
    borderRadius: 10,
    paddingVertical: 11,
    paddingHorizontal: 14,
    alignItems: 'center',
    marginTop: 6
  },
  buttonSecondary: {
    backgroundColor: '#c7d2fe'
  },
  buttonText: {
    color: '#1f2a44',
    fontWeight: '700'
  },
  muted: {
    color: '#64748b',
    marginTop: 6
  },
  chip: {
    backgroundColor: '#eef2ff',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#c7d2fe'
  }
});
