import React, { useState } from 'react';
import { API_URL } from '@dotenv'
import { ScrollView, StyleSheet, Text, View, Alert } from 'react-native';
import { useHeaderHeight } from '@react-navigation/stack';
import colors from '../helper/Colors';
import RoundIconBtn from './RoundIconBtn';
import { useNotes } from '../contexts/NoteProvider';
import NoteInputModal from './NoteInputModal';

const NoteDetail = props => {
  const [note, setNote] = useState(props.route.params.note);
  const { notes, setNotes } = useNotes();
  const headerHeight = useHeaderHeight();
  const [showModal, setShowModal] = useState(false);
  const [isEdit, setIsEdit] = useState(false);

  /**
 * Update a note
 */
  const handleUpdate = async (title, description) => {

    fetch(API_URL + '/notes', {
      method: 'PUT',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        "id": note.id,
        "title": title,
        "description": description,
        "created_at": note.created_at,
      }),
    })
      .then((response) => {
        if (response.status == 200) {
          return response.json();
        } else {
          throw (new Error('Not updated'));
        }
      })
      .then((responseJson) => {
        if (responseJson) {
          const newNotes = notes.filter(n => {
            if (n.id === note.id) {
              n.title = title;
              n.description = description;
              n.isUpdated = true;
              n.time = responseJson.updated_at;

              setNote(n);
            }
            return n;
          });

          setNotes(newNotes);
        }
      })
      .catch((error) => {
        alert(error);
      });
  }

  /**
   * Delete a note via API
   */
  const deleteNote = async () => {
    fetch(API_URL + `/notes/${note.id}`, {
      method: 'DELETE',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: '',
    })
      .then((response) => {
        if (response.status == 200) {
          return response.json();
        } else {
          throw (new Error('Not deleted'));
        }
      })
      .then((responseJson) => {
        if (responseJson) {
          const newNotes = notes.filter(n => n.id !== note.id);
          setNotes(newNotes);
          props.navigation.goBack();
        }
      })
      .catch((error) => {
        alert(error);
      });
  }

  const displayDeleteAlert = () => {
    Alert.alert(
      'Are You Sure?',
      'This action will delete your note permanently!',
      [
        {
          text: 'Delete',
          onPress: deleteNote,
        },
        {
          text: 'No Thanks',
          onPress: () => console.log('no thanks'),
        },
      ],
      {
        cancelable: true,
      }
    );
  };

  const handleOnClose = () => setShowModal(false);

  const openEditModal = () => {
    setIsEdit(true);
    setShowModal(true);
  };

  return (
    <>
      <ScrollView
        contentContainerStyle={[styles.container, { paddingTop: headerHeight }]}
      >
        <Text style={styles.time}>
          {note.isUpdated
            ? `Updated At ${note.updated_at}`
            : `Created At ${note.created_at}`}
        </Text>
        <Text style={styles.title}>{note.title}</Text>
        <Text style={styles.description}>{note.description}</Text>
      </ScrollView>
      <View style={styles.btnContainer}>
        <RoundIconBtn
          antIconName='edit'
          style={{ marginBottom: 10 }}
          onPress={openEditModal} />
        <RoundIconBtn
          antIconName='delete'
          style={{ backgroundColor: colors.ERROR }}
          onPress={displayDeleteAlert}
        />

      </View>
      <NoteInputModal
        isEdit={isEdit}
        note={note}
        onClose={handleOnClose}
        onSubmit={handleUpdate}
        visible={showModal}
      />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 15,
  },
  title: {
    fontSize: 30,
    color: colors.VIOLET,
    fontWeight: 'bold',
  },
  description: {
    fontSize: 18,
    opacity: 0.6,
  },
  time: {
    textAlign: 'right',
    fontSize: 12,
    opacity: 0.5,
  },
  btnContainer: {
    position: 'absolute',
    right: 15,
    bottom: 50,
  },
});

export default NoteDetail;
