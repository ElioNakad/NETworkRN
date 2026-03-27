import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { url } from "../config";

/* =============================
   🔹 DATE FORMATTER
============================= */
const formatDateTime = (dateString) => {
  const d = new Date(dateString);
  return d.toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};


export default function Reviews({ route }) {
  const { contact, defaultDescriptions } = route.params;

  const [selectedLabel, setSelectedLabel] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(false);

  const [modalVisible, setModalVisible] = useState(false);
  const [review, setReview] = useState("");
  const [loadingSubmit, setLoadingSubmit] = useState(false);

  const [currentUserId, setCurrentUserId] = useState(null);


 // const url="192.168.43.73"

  /* =============================
     🔹 FETCH REVIEWS
  ============================= */
  const loadReviews = async (label) => {
    try {
      setSelectedLabel(label);
      setLoadingReviews(true);

      const token = await AsyncStorage.getItem("token");

      const res = await fetch(
        `http://${url}:3000/api/review/my-reviews?labelId=${label.id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      setReviews(data.reviews);
      setCurrentUserId(data.currentUserId);

    } catch (err) {
      Alert.alert("Error", err.message);
    } finally {
      setLoadingReviews(false);
    }
  };

  /* =============================
     🔹 SUBMIT REVIEW
  ============================= */
  const submitReview = async () => {
    if (!review.trim()) {
      Alert.alert("Error", "Review cannot be empty");
      return;
    }

    try {
      setLoadingSubmit(true);
      const token = await AsyncStorage.getItem("token");

      const res = await fetch(
        "http://"+url+":3000/api/review/insert-review",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            default_description_id: selectedLabel.id,
            review,
          }),
        }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      Alert.alert("Success", "Review submitted ⭐");
      setModalVisible(false);
      setReview("");

      loadReviews(selectedLabel);
    } catch (err) {
      Alert.alert("Error", err.message);
    } finally {
      setLoadingSubmit(false);
    }
  };

  const deleteReview = async (reviewId) => {
    console.log("DELETING review_id:", reviewId);
  Alert.alert(
    "Delete review",
    "Are you sure you want to delete this review?",
    [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            const token = await AsyncStorage.getItem("token");

            const res = await fetch(
              `http://${url}:3000/api/review/delete-review/${reviewId}`,
              {
                method: "DELETE",
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              }
            );

            const data = await res.json();

            if (!res.ok) {
              Alert.alert("Delete failed", data.message);
              return;
            }

            // ✅ FIXED LINE
            setReviews(prev =>
              prev.filter(r => r.review_id !== reviewId)
            );

          } catch (err) {
            Alert.alert("Delete failed", err.message);
          }
        },
      },
    ]
  );
};



  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.title}>Reviews</Text>
        <Text style={styles.contactName}>{contact.display_name}</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* ================= LABELS ================= */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select a Category</Text>

          {defaultDescriptions.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.labelCard,
                selectedLabel?.id === item.id && styles.activeLabel,
              ]}
              onPress={() => loadReviews(item)}
              activeOpacity={0.7}
            >
              <View style={styles.labelHeader}>
                <Text
                  style={[
                    styles.label,
                    selectedLabel?.id === item.id && styles.activeLabelText,
                  ]}
                >
                  {item.label}
                </Text>
                {selectedLabel?.id === item.id && (
                  <View style={styles.selectedBadge}>
                    <Text style={styles.selectedBadgeText}>✓</Text>
                  </View>
                )}
              </View>
              <Text style={styles.description}>{item.description}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* ================= REVIEWS ================= */}
        {selectedLabel && (
          <View style={styles.section}>
            <View style={styles.reviewsHeader}>
              <Text style={styles.sectionTitle}>Reviews</Text>
              <Text style={styles.categoryBadge}>
                {selectedLabel.label}
              </Text>
            </View>

            {loadingReviews && (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#f5b400" />
                <Text style={styles.loadingText}>Loading reviews...</Text>
              </View>
            )}

            {!loadingReviews && reviews.length === 0 && (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyIcon}>📝</Text>
                <Text style={styles.emptyText}>No reviews yet</Text>
                <Text style={styles.emptySubtext}>
                  Be the first to add a review!
                </Text>
              </View>
            )}

            {!loadingReviews &&
              reviews.map((r, index) => {
                const isMine = r.reviewer_id === currentUserId;
                return(
                <View key={r.review_id} style={styles.reviewCard}>
                  <View style={styles.reviewHeader}>
                    <View style={styles.avatarCircle}>
                      <Text style={styles.avatarText}>
                        {r.reviewer_fname?.[0]}
                        {r.reviewer_lname?.[0]}
                      </Text>
                    </View>

                    <View style={styles.reviewerInfo}>
                      <Text style={styles.reviewer}>
                        {r.reviewer_fname} {r.reviewer_lname} {"\n"+r.reviewer_email}
                      </Text>

                      {isMine && (
                        <View style={styles.myBadge}>
                         <TouchableOpacity onPress={() => deleteReview(r.review_id)}>
                         <Text style={styles.myBadgeText}>🗑️</Text>
                         </TouchableOpacity>
                        </View>
                      )}

                      <Text style={styles.reviewMeta}>
                        {formatDateTime(r.review_date)} · Review #{reviews.length - index}
                      </Text>

                    </View>
                  </View>

                  <Text style={styles.reviewText}>{r.review_text}</Text>
                </View>
              
              )})
            }
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* ================= FAB ================= */}
      {selectedLabel && (
        <TouchableOpacity
          style={styles.fab}
          onPress={() => setModalVisible(true)}
        >
          <Text style={styles.fabText}>✍️</Text>
        </TouchableOpacity>
      )}

      {/* ================= MODAL ================= */}
      <Modal transparent visible={modalVisible} animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Write a Review</Text>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={styles.closeButton}
              >
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.modalCategoryTag}>
              <Text style={styles.modalCategoryText}>
                {selectedLabel?.label}
              </Text>
            </View>

            <TextInput
              style={styles.input}
              placeholder="Share your thoughts..."
              multiline
              value={review}
              onChangeText={setReview}
              maxLength={500}
            />

            <Text style={styles.charCount}>{review.length}/500</Text>

            <TouchableOpacity
              style={styles.submitButton}
              onPress={submitReview}
              disabled={loadingSubmit}
            >
              {loadingSubmit ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.submitText}>Submit Review</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

/* =============================
   🔹 STYLES
============================= */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "rgba(13,17,23,0.97)",
  },

  header: {
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },

  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "white",
  },

  contactName: {
    fontSize: 16,
    color: "#aaa",
    marginTop: 4,
  },

  section: {
    paddingHorizontal: 20,
    paddingTop: 24,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 16,
    color: "white",
  },

  /* ================= LABELS ================= */

  labelCard: {
    backgroundColor: "#161B22",
    padding: 18,
    borderRadius: 18,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#30363D",
  },

  activeLabel: {
    borderColor: "#4F46E5",
    backgroundColor: "#1E1B3A",
  },

  labelHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  label: {
    fontSize: 16,
    fontWeight: "700",
    color: "white",
  },

  activeLabelText: {
    color: "#4F46E5",
  },

  description: {
    color: "#aaa",
    marginTop: 6,
  },

  selectedBadge: {
    backgroundColor: "#4F46E5",
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },

  selectedBadgeText: {
    color: "#fff",
    fontWeight: "700",
  },

  /* ================= REVIEWS ================= */

  reviewsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  categoryBadge: {
    backgroundColor: "#4F46E5",
    color: "#fff",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    fontSize: 12,
    fontWeight: "700",
  },

  reviewCard: {
    backgroundColor: "#161B22",
    padding: 18,
    borderRadius: 18,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#30363D",
  },

  reviewHeader: {
    flexDirection: "row",
    marginBottom: 12,
  },

  avatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#4F46E5",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  avatarText: {
    color: "#fff",
    fontWeight: "700",
  },

  reviewer: {
    fontWeight: "700",
    color: "white",
  },

  reviewMeta: {
    fontSize: 12,
    color: "#777",
    marginTop: 4,
  },

  reviewText: {
    marginTop: 6,
    color: "#ccc",
    lineHeight: 22,
  },

  /* ================= LOADING & EMPTY ================= */

  loadingContainer: {
    alignItems: "center",
    paddingVertical: 40,
  },

  loadingText: {
    marginTop: 12,
    color: "#aaa",
  },

  emptyContainer: {
    alignItems: "center",
    paddingVertical: 60,
  },

  emptyIcon: {
    fontSize: 48,
  },

  emptyText: {
    color: "white",
    fontWeight: "600",
  },

  emptySubtext: {
    color: "#777",
    marginTop: 6,
  },

  /* ================= FAB ================= */

  fab: {
    position: "absolute",
    right: 20,
    bottom: 24,
    backgroundColor: "#4F46E5",
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    elevation: 8,
  },

  fabText: {
    fontSize: 26,
    color: "white",
  },

  /* ================= MODAL ================= */

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "flex-end",
  },

  modalContent: {
    backgroundColor: "#161B22",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: "#30363D",
  },

  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  modalTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "white",
  },

  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#30363D",
    alignItems: "center",
    justifyContent: "center",
  },

  closeButtonText: {
    color: "white",
  },

  modalCategoryTag: {
    marginTop: 12,
    marginBottom: 16,
    borderColor: "#4F46E5",
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    alignSelf: "flex-start",
  },

  modalCategoryText: {
    color: "#4F46E5",
    fontWeight: "600",
  },

  input: {
    borderWidth: 1,
    borderColor: "#30363D",
    borderRadius: 18,
    padding: 16,
    minHeight: 140,
    backgroundColor: "#0D1117",
    color: "white",
  },

  charCount: {
    textAlign: "right",
    color: "#777",
    marginTop: 6,
  },

  submitButton: {
    backgroundColor: "#4F46E5",
    padding: 18,
    borderRadius: 18,
    marginTop: 20,
    alignItems: "center",
  },

  submitText: {
    color: "#fff",
    fontWeight: "700",
  },
});